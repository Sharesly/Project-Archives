import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, serverTimestamp, orderBy } from 'firebase/firestore';
import { db, auth } from './firebase';
import { Project, Comment, Metrics } from '../types';
import { APP_CONFIG, PROJECT_STATUSES } from '../config';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const message = error instanceof Error ? error.message : String(error);

  // Log only non-sensitive info in production
  console.error(`Firestore ${operationType} error on "${path}": ${message}`);

  throw new Error(`Operation failed: ${message}`);
}

// The final "launched" status from the workflow
const launchedStatus = PROJECT_STATUSES[PROJECT_STATUSES.length - 1];

export const api = {
  getProjects: async (): Promise<Project[]> => {
    try {
      const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'projects');
    }
  },

  createProject: async (project: Omit<Project, 'id' | 'code'>): Promise<Project> => {
    try {
      const newProjectData = {
        ...project,
        code: `${APP_CONFIG.projectCodePrefix}-${Math.floor(Math.random() * 900) + 100}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, 'projects'), newProjectData);
      return { id: docRef.id, ...newProjectData } as unknown as Project;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'projects');
    }
  },

  updateProject: async (id: string, updates: Partial<Project>): Promise<Project> => {
    try {
      const docRef = doc(db, 'projects', id);
      const updateData = { ...updates, updatedAt: serverTimestamp() };
      await updateDoc(docRef, updateData);
      const updatedDoc = await getDoc(docRef);
      return { id: updatedDoc.id, ...updatedDoc.data() } as Project;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `projects/${id}`);
    }
  },

  deleteProject: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `projects/${id}`);
    }
  },

  getComments: async (projectId: string): Promise<Comment[]> => {
    try {
      const q = query(collection(db, 'comments'), where('projectId', '==', projectId), orderBy('timestamp', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'comments');
    }
  },

  addComment: async (projectId: string, text: string): Promise<Comment> => {
    try {
      const newComment = {
        projectId,
        author: {
          name: auth.currentUser?.displayName || 'Current User',
          initials: auth.currentUser?.displayName?.substring(0, 2).toUpperCase() || 'CU'
        },
        text,
        timestamp: new Date().toISOString(),
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, 'comments'), newComment);
      return { id: docRef.id, ...newComment } as Comment;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'comments');
    }
  },

  getMetrics: async (): Promise<Metrics> => {
    try {
      const snapshot = await getDocs(collection(db, 'projects'));
      const projects = snapshot.docs.map(doc => doc.data() as Project);

      return {
        totalRecords: projects.length,
        riskLevel: 'Low',
        activeProjects: projects.filter(p => p.status !== launchedStatus).length,
        projectsByStatus: projects.reduce((acc, p) => {
          acc[p.status] = (acc[p.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'projects');
    }
  }
};
