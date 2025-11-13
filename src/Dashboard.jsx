import React from 'react'
import Header from './components/Header';
import EquipmentAvailability from './components/EquipmentAvail';
import ComplaintList from './components/ComplaintList';
import CleaningStatus from './components/CleaningStatus';
import NoticeBoard from './components/NoticeBoard';
import DateCalendar from './components/DateCalendar';


export const HostelDashboard = ({ user, userType, onLogout }) => {
  return (
    <div className="app">
      <Header user={user} userType={userType} onLogout={onLogout} />
      <div className="container">
        <NoticeBoard canAdd={false} canEdit={false} />
        <CleaningStatus showAll={false} canEdit={false} user={user} userType={userType} />
        <ComplaintList canAdd={true} canEdit={false} user={user} userType={userType} />
        <EquipmentAvailability canEdit={false} />
        <DateCalendar />
      </div>
    </div>
  );
};

export const AdminDashboard = ({ user, userType, onLogout }) => {
  return (
    <div className="app">
      <Header user={user} userType={userType} onLogout={onLogout} />
      <div className="container">
        <NoticeBoard canAdd={true} canEdit={true} />
        <CleaningStatus showAll={true} canEdit={true} user={user} userType={userType} />
        <ComplaintList canAdd={false} canEdit={true} user={user} userType={userType} />
        <EquipmentAvailability canEdit={true} />
        <DateCalendar />
      </div>
    </div>
  );
};

export const WorkerDashboard = ({ user, userType, onLogout }) => {
  return (
    <div className="app">
      <Header user={user} userType={userType} onLogout={onLogout} />
      <div className="container">
        <NoticeBoard canAdd={true} canEdit={false} />
        <CleaningStatus showAll={true} canEdit={true} user={user} userType={userType} />
        <ComplaintList canAdd={false} canEdit={true} user={user} userType={userType} />
        <EquipmentAvailability canEdit={false} />
        <DateCalendar />
      </div>
    </div>
  );
};
