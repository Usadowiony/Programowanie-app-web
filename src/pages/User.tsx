import { getCurrentUser } from '../services/userService';

function User() {

    const user = getCurrentUser();

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
            <h1 className="flex-col text-4xl font-bold mb-6">Cześć, {user.firstName} {user.lastName}!</h1>
        </div>
        </div>
    )
}

export default User