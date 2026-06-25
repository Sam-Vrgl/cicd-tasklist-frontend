import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TaskItem } from '../components/TaskItem';
import type { Task } from '../types/task';

const baseTask: Task = {
	id: 1,
	title: 'Ma tâche',
	description: 'Ma description',
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

describe('TaskItem', () => {
	it('renders task title and description', () => {
		render(<TaskItem task={baseTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
		expect(screen.getByText('Ma tâche')).toBeInTheDocument();
		expect(screen.getByText('Ma description')).toBeInTheDocument();
	});

	it('does not render description when null', () => {
		render(
			<TaskItem
				task={{ ...baseTask, description: null }}
				onToggle={vi.fn()}
				onDelete={vi.fn()}
				onEdit={vi.fn()}
			/>
		);
		expect(screen.queryByText('Ma description')).not.toBeInTheDocument();
	});

	it('has task-completed class when task is completed', () => {
		render(
			<TaskItem
				task={{ ...baseTask, completed: true }}
				onToggle={vi.fn()}
				onDelete={vi.fn()}
				onEdit={vi.fn()}
			/>
		);
		expect(screen.getByTestId('task-item')).toHaveClass('task-completed');
	});

	it('does not have task-completed class when not completed', () => {
		render(<TaskItem task={baseTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
		expect(screen.getByTestId('task-item')).not.toHaveClass('task-completed');
	});

	it('calls onToggle when checkbox is clicked', async () => {
		const user = userEvent.setup();
		const onToggle = vi.fn();
		render(<TaskItem task={baseTask} onToggle={onToggle} onDelete={vi.fn()} onEdit={vi.fn()} />);

		await user.click(screen.getByRole('checkbox'));
		expect(onToggle).toHaveBeenCalledWith(1);
	});

	it('enters edit mode when edit button clicked', async () => {
		const user = userEvent.setup();
		render(<TaskItem task={baseTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);

		await user.click(screen.getByTitle('Modifier'));
		expect(screen.getByLabelText('Modifier le titre')).toBeInTheDocument();
		expect(screen.getByLabelText('Modifier la description')).toBeInTheDocument();
	});

	it('calls onEdit with new values when save clicked with valid title', async () => {
		const user = userEvent.setup();
		const onEdit = vi.fn();
		render(<TaskItem task={baseTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />);

		await user.click(screen.getByTitle('Modifier'));
		const titleInput = screen.getByLabelText('Modifier le titre');
		await user.clear(titleInput);
		await user.type(titleInput, 'Titre modifié');
		await user.click(screen.getByText('Enregistrer'));

		expect(onEdit).toHaveBeenCalledWith(1, expect.objectContaining({ title: 'Titre modifié' }));
	});

	it('does not call onEdit when title is empty on save', async () => {
		const user = userEvent.setup();
		const onEdit = vi.fn();
		render(<TaskItem task={baseTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />);

		await user.click(screen.getByTitle('Modifier'));
		const titleInput = screen.getByLabelText('Modifier le titre');
		await user.clear(titleInput);
		await user.click(screen.getByText('Enregistrer'));

		expect(onEdit).not.toHaveBeenCalled();
	});

	it('cancels edit and restores original title', async () => {
		const user = userEvent.setup();
		render(<TaskItem task={baseTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);

		await user.click(screen.getByTitle('Modifier'));
		const titleInput = screen.getByLabelText('Modifier le titre');
		await user.clear(titleInput);
		await user.type(titleInput, 'Titre temporaire');
		await user.click(screen.getByText('Annuler'));

		expect(screen.getByText('Ma tâche')).toBeInTheDocument();
	});

	it('shows warning icon on first delete click', async () => {
		const user = userEvent.setup();
		render(<TaskItem task={baseTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);

		await user.click(screen.getByTitle('Supprimer'));
		expect(screen.getByText('⚠️')).toBeInTheDocument();
	});

	it('calls onDelete on second delete click', async () => {
		const user = userEvent.setup();
		const onDelete = vi.fn();
		render(<TaskItem task={baseTask} onToggle={vi.fn()} onDelete={onDelete} onEdit={vi.fn()} />);

		await user.click(screen.getByTitle('Supprimer'));
		await user.click(screen.getByTitle('Supprimer'));

		expect(onDelete).toHaveBeenCalledWith(1);
	});

	it('omits description from edit payload when empty', async () => {
		const user = userEvent.setup();
		const onEdit = vi.fn();
		render(
			<TaskItem
				task={{ ...baseTask, description: null }}
				onToggle={vi.fn()}
				onDelete={vi.fn()}
				onEdit={onEdit}
			/>
		);

		await user.click(screen.getByTitle('Modifier'));
		await user.click(screen.getByText('Enregistrer'));

		expect(onEdit).toHaveBeenCalledWith(1, expect.objectContaining({ description: undefined }));
	});
});
