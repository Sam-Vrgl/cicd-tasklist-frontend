import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTasks, getTask, createTask, updateTask, deleteTask } from '../api/taskApi';

const mockTask = {
	id: 1,
	title: 'Test',
	description: null,
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

beforeEach(() => {
	vi.restoreAllMocks();
});

describe('taskApi', () => {
	describe('getTasks', () => {
		it('returns array on success', async () => {
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve([mockTask]),
			}));

			const tasks = await getTasks();
			expect(tasks).toEqual([mockTask]);
			expect(fetch).toHaveBeenCalledWith('/api/tasks');
		});

		it('throws on HTTP error', async () => {
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				text: () => Promise.resolve('Internal Server Error'),
			}));

			await expect(getTasks()).rejects.toThrow('HTTP 500: Internal Server Error');
		});
	});

	describe('getTask', () => {
		it('returns task on success', async () => {
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockTask),
			}));

			const task = await getTask(1);
			expect(task).toEqual(mockTask);
			expect(fetch).toHaveBeenCalledWith('/api/tasks/1');
		});

		it('throws on HTTP error', async () => {
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
				ok: false,
				status: 404,
				text: () => Promise.resolve('Not Found'),
			}));

			await expect(getTask(999)).rejects.toThrow('HTTP 404: Not Found');
		});
	});

	describe('createTask', () => {
		it('creates and returns task', async () => {
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockTask),
			}));

			const task = await createTask({ title: 'Test' });
			expect(task).toEqual(mockTask);
			expect(fetch).toHaveBeenCalledWith(
				'/api/tasks',
				expect.objectContaining({
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
				})
			);
		});

		it('throws on HTTP error', async () => {
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
				ok: false,
				status: 400,
				text: () => Promise.resolve('Bad Request'),
			}));

			await expect(createTask({ title: '' })).rejects.toThrow('HTTP 400: Bad Request');
		});
	});

	describe('updateTask', () => {
		it('updates and returns task', async () => {
			const updated = { ...mockTask, title: 'Updated' };
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(updated),
			}));

			const task = await updateTask(1, { title: 'Updated' });
			expect(task).toEqual(updated);
			expect(fetch).toHaveBeenCalledWith(
				'/api/tasks/1',
				expect.objectContaining({ method: 'PUT' })
			);
		});

		it('throws on HTTP error', async () => {
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
				ok: false,
				status: 404,
				text: () => Promise.resolve('Not Found'),
			}));

			await expect(updateTask(999, { title: 'x' })).rejects.toThrow('HTTP 404: Not Found');
		});
	});

	describe('deleteTask', () => {
		it('resolves on success', async () => {
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));

			await expect(deleteTask(1)).resolves.toBeUndefined();
			expect(fetch).toHaveBeenCalledWith(
				'/api/tasks/1',
				expect.objectContaining({ method: 'DELETE' })
			);
		});

		it('throws on HTTP error', async () => {
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
				ok: false,
				status: 404,
				text: () => Promise.resolve('Not Found'),
			}));

			await expect(deleteTask(999)).rejects.toThrow('HTTP 404: Not Found');
		});
	});
});
