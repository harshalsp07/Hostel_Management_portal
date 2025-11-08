import React from 'react'
import Header from './components/Header';
import EquipmentAvailability from './components/EquipmentAvail';
import ComplaintList from './components/ComplaintList';
import ComplaintCard from './components/ComplaintCard';
import CleaningStatus from './components/CleaningStatus';
import NoticeBoard from './components/NoticeBoard';


export const HostelDashboard = ({ user, onLogout }) => {
  const handleLogout = async () => {
    await onLogout?.();
  };

  return (
    <div className="app">
      <Header user={user} onLogout={onLogout} />
      <div className="container">
        <NoticeBoard />
        <CleaningStatus />
        <ComplaintList />
        <EquipmentAvailability />
      </div>
    </div>
  );
};

export const AdminDashboard = ({ user, onLogout }) => {
  const handleLogout = async () => await onLogout?.();
  return (
    <div className="app">
      <Header user={user} onLogout={onLogout} />
      <div className="container">
        <NoticeBoard canAdd={true} />
        <CleaningStatus showAll={true} />
        <ComplaintList canAdd={false} />
        <EquipmentAvailability />
      </div>
    </div>
  );
};

export const WorkerDashboard = ({ user, onLogout }) => {
  const handleLogout = async () => await onLogout?.();
  return (
    <div className="app">
      <Header user={user} onLogout={onLogout} />
      <div className="container">
        <NoticeBoard canAdd={true} />
        <CleaningStatus showAll={true} />
        <ComplaintList canAdd={false} />
        <EquipmentAvailability />
      </div>
    </div>
  );
};
