import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AccountSettings from '../AccountSettings';

// Mock lucide-react
vi.mock('lucide-react', () => ({
    ChevronDown: () => <div>ChevronDown</div>,
    Bell: () => <div>Bell</div>,
    CheckCircle2: () => <div>CheckCircle2</div>,
    AlertCircle: () => <div>AlertCircle</div>,
    LogOut: () => <div>LogOut</div>,
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        Link: ({ children, to }) => <a href={to}>{children}</a>,
    };
});

describe('AccountSettings Component', () => {
    const mockDoctor = {
        first_name: 'John',
        last_name: 'Doe',
        username: 'JohnDoe1',
        email: 'john@example.com',
        phone_no: '1234567890',
        qualification: 'MD',
    };

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem('access_token', 'fake-token');
        localStorage.setItem('doctor', JSON.stringify(mockDoctor));

        // Mock fetch
        global.fetch = vi.fn();
    });

    it('renders correctly with doctor data', () => {
        render(
            <MemoryRouter>
                <AccountSettings />
            </MemoryRouter>
        );

        expect(screen.getByText('Profile Information')).toBeInTheDocument();
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
        expect(screen.getByText('JohnDoe1')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('switches tabs correctly', () => {
        render(
            <MemoryRouter>
                <AccountSettings />
            </MemoryRouter>
        );

        // Initial state is 'basic' profile tab
        expect(screen.getByText('Profile Information')).toBeInTheDocument();

        // Switch to Sign in method tab
        fireEvent.click(screen.getByText('Sign in method'));
        expect(screen.getByText('Sign in Method')).toBeInTheDocument();

        // Switch to Deactivate account tab
        fireEvent.click(screen.getByText('Deactivate account'));
        expect(screen.getByText('Account Ownership')).toBeInTheDocument();
    });

    it('updates profile successfully', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ ...mockDoctor, first_name: 'Johnny' }),
        });

        render(
            <MemoryRouter>
                <AccountSettings />
            </MemoryRouter>
        );

        const firstNameInput = screen.getByDisplayValue('John');
        fireEvent.change(firstNameInput, { target: { value: 'Johnny' } });

        fireEvent.click(screen.getByText('Update Profile'));

        await waitFor(() => {
            expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
        });

        expect(global.fetch).toHaveBeenCalledWith(
            'http://localhost:8000/auth/update-profile',
            expect.objectContaining({
                method: 'PATCH',
                body: expect.stringContaining('"first_name":"Johnny"'),
            })
        );
    });

    it('shows error message on update failure', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ detail: 'Update failed' }),
        });

        render(
            <MemoryRouter>
                <AccountSettings />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText('Update Profile'));

        await waitFor(() => {
            expect(screen.getByText('Update failed')).toBeInTheDocument();
        });
    });

    it('opens and closes delete modal', () => {
        render(
            <MemoryRouter>
                <AccountSettings />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText('Deactivate account'));
        fireEvent.click(screen.getByText('Delete Account'));

        expect(screen.getByText('Confirm Account Deletion')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Cancel'));
        expect(screen.queryByText('Confirm Account Deletion')).not.toBeInTheDocument();
    });

    it('deletes account successfully', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
        });

        // Mock window.alert
        vi.spyOn(window, 'alert').mockImplementation(() => { });

        render(
            <MemoryRouter>
                <AccountSettings />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText('Deactivate account'));
        fireEvent.click(screen.getByText('Delete Account'));

        const deleteButtons = screen.getAllByText('Delete Account');
        // The first one is in the tab content, the second one is in the modal
        fireEvent.click(deleteButtons[1]);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });

        expect(localStorage.getItem('access_token')).toBeNull();
    });
});
