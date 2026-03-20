import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/common/Toast';
import { logoutUser } from '../firebase/auth';
import { getShopStaff, updateStaffRole, removeStaffAccess } from '../firebase/firestore';
import { useNavigate } from 'react-router-dom';

export function Admin() {
  const { user, userProfile, isAdmin, shopId } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (!shopId || !isAdmin) return;
    loadStaff();
  }, [shopId, isAdmin]);

  const loadStaff = async () => {
    try {
      const members = await getShopStaff(shopId);
      setStaff(members);
    } catch (err) {
      showToast('Failed to load staff', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch {
      showToast('Failed to sign out', 'error');
    }
  };

  const handleRoleChange = async (uid, newRole) => {
    try {
      await updateStaffRole(uid, newRole);
      showToast('Role updated', 'success');
      setSelectedUser(null);
      loadStaff();
    } catch {
      showToast('Failed to update role', 'error');
    }
  };

  const handleDisableUser = async (uid) => {
    if (!window.confirm('Remove this user\'s access to the shop?')) return;
    try {
      await removeStaffAccess(uid);
      showToast('Access removed', 'success');
      setSelectedUser(null);
      loadStaff();
    } catch {
      showToast('Failed to remove access', 'error');
    }
  };

  const roleLabel = (role) => {
    const labels = { admin: 'Admin', staff: 'Staff', disabled: 'Disabled' };
    return labels[role] || role;
  };

  const roleBadgeClass = (role) => {
    if (role === 'admin') return 'bg-purple-100 text-purple-700';
    if (role === 'staff') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-500';
  };

  return (
    <Layout title="Account">
      <div className="p-4 space-y-4 pb-8">
        {/* Profile Card */}
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary-500 flex items-center justify-center text-white text-2xl font-bold">
              {(user?.displayName || user?.email || '?')[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">{user?.displayName || 'User'}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold ${roleBadgeClass(userProfile?.role)}`}>
                {roleLabel(userProfile?.role)}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">Shop ID</p>
            <p className="font-mono text-sm font-semibold text-gray-800">{shopId}</p>
          </div>
        </Card>

        {/* Staff Management (Admin only) */}
        {isAdmin && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Shop Staff</h3>
              <span className="text-sm text-gray-500">{staff.length} member{staff.length !== 1 ? 's' : ''}</span>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : (
              <div className="space-y-3">
                {staff.map((member) => (
                  <Card
                    key={member.uid}
                    className="p-4"
                    onClick={member.uid !== user.uid ? () => setSelectedUser(member) : undefined}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{member.displayName || member.email}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${roleBadgeClass(member.role)}`}>
                        {roleLabel(member.role)}
                      </span>
                    </div>
                    {member.uid === user.uid && (
                      <p className="text-xs text-gray-400 mt-1">This is you</p>
                    )}
                  </Card>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-500 text-center">
              Others can join your shop by signing up with Shop ID: <strong>{shopId}</strong>
            </p>
          </>
        )}

        {/* Sign Out */}
        <div className="pt-4">
          <Button variant="danger" fullWidth onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </div>

      {/* Staff Role Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="Manage Staff"
        footer={
          selectedUser && selectedUser.role !== 'disabled' ? (
            <Button variant="danger" fullWidth onClick={() => handleDisableUser(selectedUser.uid)}>
              Remove Access
            </Button>
          ) : null
        }
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-bold">{selectedUser.displayName || selectedUser.email}</p>
              <p className="text-sm text-gray-500">{selectedUser.email}</p>
            </div>

            <p className="text-sm font-medium text-gray-700">Change Role</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleRoleChange(selectedUser.uid, 'staff')}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  selectedUser.role === 'staff'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Staff
              </button>
              <button
                onClick={() => handleRoleChange(selectedUser.uid, 'admin')}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  selectedUser.role === 'admin'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Admin
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Admins can manage products, staff, and see all data. Staff can only record sales and view inventory.
            </p>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
