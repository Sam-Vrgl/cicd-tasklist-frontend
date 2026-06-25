import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TaskForm } from '../components/TaskForm';

describe('TaskForm', () => {
	it('renders create form by default', () => {
		render(<TaskForm onSubmit={vi.fn()} />);
		expect(screen.getByText('Nouvelle tâche')).toBeInTheDocument();
		expect(screen.getByText('Ajouter')).toBeInTheDocument();
	});

	it('renders edit form when mode is edit', () => {
		render(<TaskForm onSubmit={vi.fn()} mode="edit" />);
		expect(screen.getByText('Modifier la tâche')).toBeInTheDocument();
		expect(screen.getByText('Modifier')).toBeInTheDocument();
	});

	it('shows validation error when title is empty', async () => {
		const user = userEvent.setup();
		render(<TaskForm onSubmit={vi.fn()} />);

		await user.click(screen.getByText('Ajouter'));
		expect(screen.getByRole('alert')).toHaveTextContent('Le titre est requis');
	});

	it('clears validation error when user types in title', async () => {
		const user = userEvent.setup();
		render(<TaskForm onSubmit={vi.fn()} />);

		await user.click(screen.getByText('Ajouter'));
		expect(screen.getByRole('alert')).toBeInTheDocument();

		await user.type(screen.getByLabelText('Titre'), 'Ma tâche');
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
	});

	it('calls onSubmit with title and description', async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		render(<TaskForm onSubmit={onSubmit} />);

		await user.type(screen.getByLabelText('Titre'), 'Ma tâche');
		await user.type(screen.getByLabelText('Description'), 'Ma description');
		await user.click(screen.getByText('Ajouter'));

		expect(onSubmit).toHaveBeenCalledWith({
			title: 'Ma tâche',
			description: 'Ma description',
		});
	});

	it('calls onSubmit without description when empty', async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		render(<TaskForm onSubmit={onSubmit} />);

		await user.type(screen.getByLabelText('Titre'), 'Ma tâche');
		await user.click(screen.getByText('Ajouter'));

		expect(onSubmit).toHaveBeenCalledWith({ title: 'Ma tâche', description: undefined });
	});

	it('resets form fields after create submission', async () => {
		const user = userEvent.setup();
		render(<TaskForm onSubmit={vi.fn()} />);

		const titleInput = screen.getByLabelText('Titre');
		await user.type(titleInput, 'Ma tâche');
		await user.click(screen.getByText('Ajouter'));

		expect(titleInput).toHaveValue('');
	});

	it('does not reset form in edit mode after submission', async () => {
		const user = userEvent.setup();
		render(
			<TaskForm
				onSubmit={vi.fn()}
				mode="edit"
				initialValues={{ title: 'Tâche existante' }}
			/>
		);

		const titleInput = screen.getByLabelText('Titre');
		expect(titleInput).toHaveValue('Tâche existante');
		await user.click(screen.getByText('Modifier'));

		expect(titleInput).toHaveValue('Tâche existante');
	});

	it('shows cancel button when onCancel is provided', () => {
		render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
		expect(screen.getByText('Annuler')).toBeInTheDocument();
	});

	it('does not show cancel button without onCancel', () => {
		render(<TaskForm onSubmit={vi.fn()} />);
		expect(screen.queryByText('Annuler')).not.toBeInTheDocument();
	});

	it('calls onCancel when cancel button is clicked', async () => {
		const user = userEvent.setup();
		const onCancel = vi.fn();
		render(<TaskForm onSubmit={vi.fn()} onCancel={onCancel} />);

		await user.click(screen.getByText('Annuler'));
		expect(onCancel).toHaveBeenCalled();
	});

	it('renders with initial values pre-filled', () => {
		render(
			<TaskForm
				onSubmit={vi.fn()}
				initialValues={{ title: 'Titre initial', description: 'Desc initiale' }}
			/>
		);
		expect(screen.getByLabelText('Titre')).toHaveValue('Titre initial');
		expect(screen.getByLabelText('Description')).toHaveValue('Desc initiale');
	});
});
