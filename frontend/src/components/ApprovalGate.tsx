import React from 'react';
import { useUserApprovalStatus } from '../hooks/useQueries';
import { Clock, XCircle, Shield } from 'lucide-react';

export default function ApprovalGate() {
  const { data: approvalStatus } = useUserApprovalStatus();

  const getStatusConfig = () => {
    switch (approvalStatus) {
      case 'pending':
        return {
          icon: Clock,
          title: 'Account Pending Approval',
          message: 'Your account is currently under review. An administrator will approve your access soon.',
          bgColor: 'bg-yellow-50',
          iconColor: 'text-yellow-600',
          borderColor: 'border-yellow-200',
        };
      case 'rejected':
        return {
          icon: XCircle,
          title: 'Account Access Denied',
          message: 'Your account access has been denied. Please contact an administrator for more information.',
          bgColor: 'bg-red-50',
          iconColor: 'text-red-600',
          borderColor: 'border-red-200',
        };
      default:
        return {
          icon: Shield,
          title: 'Checking Access',
          message: 'Verifying your account status...',
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600',
          borderColor: 'border-blue-200',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className={`max-w-md w-full ${config.bgColor} ${config.borderColor} border rounded-2xl p-8 text-center`}>
        <div className="flex justify-center mb-6">
          <Icon className={`h-16 w-16 ${config.iconColor}`} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{config.title}</h2>
        <p className="text-gray-600 leading-relaxed">{config.message}</p>
      </div>
    </div>
  );
}
