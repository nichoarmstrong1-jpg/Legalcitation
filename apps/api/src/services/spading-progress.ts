import { EventEmitter } from 'events';
import type { SpadingProgressEvent } from '@legalcitation/shared';

const projectEmitters = new Map<string, EventEmitter>();

export function emitProgress(projectId: string, event: SpadingProgressEvent): void {
  const emitter = projectEmitters.get(projectId);
  if (emitter) {
    emitter.emit('progress', event);
  }
}

export function subscribeProgress(projectId: string): EventEmitter {
  if (!projectEmitters.has(projectId)) {
    projectEmitters.set(projectId, new EventEmitter());
  }
  return projectEmitters.get(projectId)!;
}

export function cleanupProgress(projectId: string): void {
  const emitter = projectEmitters.get(projectId);
  if (emitter) {
    emitter.removeAllListeners();
    projectEmitters.delete(projectId);
  }
}
