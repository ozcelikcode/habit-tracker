const STORAGE_KEY = 'ht-deleted-tasks';
export const DELETED_TASKS_EVENT = 'ht-deleted-tasks-updated';

const hasWindow = () => typeof window !== 'undefined';

const readStorage = () => {
  if (!hasWindow() || !window.localStorage) {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeStorage = (tasks) => {
  if (!hasWindow() || !window.localStorage) {
    return tasks;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    window.dispatchEvent(new CustomEvent(DELETED_TASKS_EVENT, { detail: { tasks } }));
  } catch {
    // ignore storage failures
  }
  return tasks;
};

export const getDeletedTasks = () => readStorage();

export const getDeletedTaskIds = () => readStorage().map((task) => task.id);

export const archiveDeletedTask = (task) => {
  if (!task || typeof task.id === 'undefined') {
    return getDeletedTasks();
  }
  const current = readStorage().filter((item) => item.id !== task.id);
  const payload = {
    ...task,
    deletedAt: new Date().toISOString(),
  };
  return writeStorage([payload, ...current]);
};

export const restoreDeletedTask = (taskId) => {
  const current = readStorage();
  const restored = current.find((task) => task.id === taskId);
  if (!restored) {
    return null;
  }
  writeStorage(current.filter((task) => task.id !== taskId));
  return restored;
};

export const permanentlyDeleteTask = (taskId) => {
  const current = readStorage();
  writeStorage(current.filter((task) => task.id !== taskId));
};

export const clearDeletedTasks = () => {
  writeStorage([]);
};

export const subscribeToDeletedTasks = (callback) => {
  if (!hasWindow()) {
    return () => {};
  }
  const handler = (event) => {
    const tasks = event?.detail?.tasks ?? getDeletedTasks();
    callback(tasks);
  };
  const storageHandler = (event) => {
    if (event.key === STORAGE_KEY) {
      callback(getDeletedTasks());
    }
  };
  window.addEventListener(DELETED_TASKS_EVENT, handler);
  window.addEventListener('storage', storageHandler);
  return () => {
    window.removeEventListener(DELETED_TASKS_EVENT, handler);
    window.removeEventListener('storage', storageHandler);
  };
};
