import React, { useState } from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SchoolProfileScreen } from './screens/SchoolProfileScreen';
import { StaffOnboardingScreen } from './screens/StaffOnboardingScreen';
import { LabsScreen } from './screens/LabsScreen';
import { GradeSectionScreen } from './screens/GradeSectionScreen';
import { StudentRegistrationScreen } from './screens/StudentRegistrationScreen';
import { BusTransportScreen } from './screens/BusTransportScreen';
import { FeesManagementScreen } from './screens/FeesManagementScreen';
import { PayrollScreen } from './screens/PayrollScreen';
import { SubjectsScreen } from './screens/SubjectsScreen';
import { SmartTimetableScreen } from './screens/SmartTimetableScreen';
import { StudentAttendanceScreen } from './screens/StudentAttendanceScreen';
import { ExamsAndGradingScreen } from './screens/ExamsAndGradingScreen';
import { StandardGrade, SectionCode } from './types';

function MainApp() {
  const [currentTab, setCurrentTab] = useState<string>('timetable');
  const { substitutionsList } = useSchool();

  const pendingApprovalsCount = substitutionsList.filter(
    (s) => s.status === 'Pending Timetable In-charge Approval'
  ).length;

  const handleNavigateToTimetable = (grade: StandardGrade, section: SectionCode) => {
    setCurrentTab('timetable');
  };

  const renderActiveScreen = () => {
    switch (currentTab) {
      case 'profile':
        return <SchoolProfileScreen />;
      case 'staff':
        return <StaffOnboardingScreen />;
      case 'attendance':
        return <StudentAttendanceScreen />;
      case 'exams':
        return <ExamsAndGradingScreen />;
      case 'labs':
        return <LabsScreen />;
      case 'grades':
        return <GradeSectionScreen onNavigateToTimetable={handleNavigateToTimetable} />;
      case 'students':
        return <StudentRegistrationScreen />;
      case 'buses':
        return <BusTransportScreen />;
      case 'fees':
        return <FeesManagementScreen />;
      case 'payroll':
        return <PayrollScreen />;
      case 'subjects':
        return <SubjectsScreen />;
      case 'timetable':
      default:
        return <SmartTimetableScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans">
      {/* Top Bar Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      <div className="flex flex-1 min-w-0">
        {/* Left Sidebar */}
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 p-6 overflow-y-auto max-w-[1600px]">
          {renderActiveScreen()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SchoolProvider>
      <MainApp />
    </SchoolProvider>
  );
}
