import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { BusStop } from '../types';
import {
  Bus,
  Plus,
  Phone,
  Users,
  Navigation,
  CheckCircle2,
  UserCheck,
  Edit3,
} from 'lucide-react';

export const BusTransportScreen: React.FC = () => {
  const { busFleet, addBus, updateBus, staffList, studentsList } = useSchool();
  const [selectedBusId, setSelectedBusId] = useState<string>(busFleet[0]?.id || 'BUS-01');
  const [showAddBusModal, setShowAddBusModal] = useState(false);
  const [showAddStopModal, setShowAddStopModal] = useState(false);
  const [showReassignCrewModal, setShowReassignCrewModal] = useState(false);
  const [draftDriverId, setDraftDriverId] = useState('');
  const [draftAssistantId, setDraftAssistantId] = useState('');

  // New Stop State
  const [newStop, setNewStop] = useState({
    stopName: '',
    morningPickupTime: '07:15 AM',
    afternoonDropTime: '03:30 PM',
  });

  // Drivers and Assistants ranked by Skill Matrix & eligibleRoles
  const drivers = staffList.filter(
    (s) => s.role === 'Bus Driver' || (s.eligibleRoles || []).includes('Bus Driver')
  );
  const assistants = staffList.filter(
    (s) =>
      s.role === 'Bus Assistant' ||
      s.role === 'Staff' ||
      (s.eligibleRoles || []).includes('Bus Escort / Assistant')
  );

  const selectedBus = busFleet.find((b) => b.id === selectedBusId) || busFleet[0];
  const currentDriver = staffList.find((s) => s.id === selectedBus.driverId);
  const currentAssistant = staffList.find((s) => s.id === selectedBus.assistantId);

  const openReassignCrewModal = () => {
    setDraftDriverId(selectedBus.driverId);
    setDraftAssistantId(selectedBus.assistantId);
    setShowReassignCrewModal(true);
  };

  const handleSaveCrew = (e: React.FormEvent) => {
    e.preventDefault();
    const driver = staffList.find((s) => s.id === draftDriverId);
    const assistant = staffList.find((s) => s.id === draftAssistantId);
    updateBus(selectedBus.id, {
      driverId: driver ? driver.id : selectedBus.driverId,
      driverName: driver ? driver.name : selectedBus.driverName,
      driverPhone: driver ? driver.phone : selectedBus.driverPhone,
      assistantId: assistant ? assistant.id : selectedBus.assistantId,
      assistantName: assistant ? assistant.name : selectedBus.assistantName,
      assistantPhone: assistant ? assistant.phone : selectedBus.assistantPhone,
    });
    setShowReassignCrewModal(false);
  };

  // Get all students on this bus
  const passengerStudents = studentsList.filter(
    (s) => s.busServiceOpted && s.busRouteId === selectedBus.id
  );

  // Add Bus Form State
  const [newBusData, setNewBusData] = useState({
    busNumber: `Bus 0${busFleet.length + 1}`,
    plateNumber: 'MH 12 XY 3344',
    seatingCapacity: 40,
    gpsDeviceId: `GPS-TRK-980${busFleet.length + 1}`,
    driverId: drivers[0]?.id || 'STAFF-DRV-01',
    driverName: drivers[0]?.name || 'Mr. Ramesh Shinde',
    driverPhone: drivers[0]?.phone || '+91 98220 30001',
    assistantId: assistants[0]?.id || 'STAFF-AST-01',
    assistantName: assistants[0]?.name || 'Mr. Tukaram Bhosale',
    assistantPhone: assistants[0]?.phone || '+91 98220 35001',
    routeName: 'Route 5: Kothrud - Deccan - School Campus',
    routeCode: 'R-05-WEST',
    fuelType: 'CNG' as 'CNG' | 'Diesel' | 'Electric',
    fitnessValidUntil: '2028-03-31',
    insuranceValidUntil: '2027-12-31',
    status: 'At Depot' as 'On Route' | 'At Depot' | 'Maintenance',
  });

  const handleCreateBus = (e: React.FormEvent) => {
    e.preventDefault();
    const driver = staffList.find((s) => s.id === newBusData.driverId);
    const assistant = staffList.find((s) => s.id === newBusData.assistantId);

    addBus({
      busNumber: newBusData.busNumber,
      plateNumber: newBusData.plateNumber,
      seatingCapacity: Number(newBusData.seatingCapacity),
      gpsDeviceId: newBusData.gpsDeviceId,
      driverId: newBusData.driverId,
      driverName: driver ? driver.name : newBusData.driverName,
      driverPhone: driver ? driver.phone : newBusData.driverPhone,
      assistantId: newBusData.assistantId,
      assistantName: assistant ? assistant.name : newBusData.assistantName,
      assistantPhone: assistant ? assistant.phone : newBusData.assistantPhone,
      routeName: newBusData.routeName,
      routeCode: newBusData.routeCode,
      stops: [
        { id: 'S1', stopName: 'Major Intersection Junction', morningPickupTime: '07:00 AM', afternoonDropTime: '03:15 PM' },
        { id: 'S2', stopName: 'VidyaSetu School Campus Gate', morningPickupTime: '07:55 AM', afternoonDropTime: '02:50 PM' },
      ],
      assignedStudentsCount: 0,
      fuelType: newBusData.fuelType,
      fitnessValidUntil: newBusData.fitnessValidUntil,
      insuranceValidUntil: newBusData.insuranceValidUntil,
      status: 'At Depot',
    });

    setShowAddBusModal(false);
  };

  const handleAddStopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStop.stopName.trim()) return;

    const updatedStops: BusStop[] = [
      ...selectedBus.stops,
      {
        id: `STOP-${Date.now()}`,
        stopName: newStop.stopName,
        morningPickupTime: newStop.morningPickupTime,
        afternoonDropTime: newStop.afternoonDropTime,
      },
    ];

    updateBus(selectedBus.id, { stops: updatedStops });
    setShowAddStopModal(false);
    setNewStop({
      stopName: '',
      morningPickupTime: '07:15 AM',
      afternoonDropTime: '03:30 PM',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bus className="w-5 h-5 text-indigo-600" />
            School Bus Fleet &amp; Transport Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Fleet registration, route waypoint timing, driver &amp; assistant crew assignments, and student passenger manifests
          </p>
        </div>

        <button
          onClick={() => setShowAddBusModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register New School Bus</span>
        </button>
      </div>

      {/* Bus Fleet Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {busFleet.map((bus) => {
          const isSelected = selectedBus.id === bus.id;
          const assignedCount = studentsList.filter((s) => s.busRouteId === bus.id).length;
          return (
            <div
              key={bus.id}
              onClick={() => setSelectedBusId(bus.id)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <Bus className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900">{bus.busNumber}</span>
                      <span className="block text-[10px] font-mono text-slate-500">{bus.plateNumber}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 font-mono">
                    {bus.fuelType}
                  </span>
                </div>

                <div className="mt-3 text-xs space-y-1">
                  <div className="font-semibold text-slate-800 line-clamp-1 text-[11px]">{bus.routeName}</div>
                  <div className="text-[10px] text-slate-500">
                    Driver: <strong className="text-slate-700">{bus.driverName}</strong>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Assistant: <strong className="text-slate-700">{bus.assistantName}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-200 flex justify-between items-center text-xs">
                <span className="text-slate-500 text-[11px]">Passengers:</span>
                <span className="font-mono font-bold text-indigo-700">
                  {assignedCount} / {bus.seatingCapacity}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Bus Detailed View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Driver, Assistant & Vehicle Specifications */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <span>Crew Assignment</span>
              </h3>
              <button
                type="button"
                onClick={openReassignCrewModal}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Reassign Crew</span>
              </button>
            </div>

            {/* Assigned Driver */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Assigned Driver</span>
                <span className="text-[10px] font-mono text-emerald-600">
                  {currentDriver ? currentDriver.attendanceToday : 'On Duty'}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900">{selectedBus.driverName}</div>
              <div className="flex items-center gap-1 font-mono text-slate-600 text-[11px] pt-0.5">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{selectedBus.driverPhone}</span>
              </div>
              <div className="text-[10px] text-slate-500">
                {currentDriver
                  ? `${currentDriver.primarySkill} · ${currentDriver.secondarySkill}`
                  : 'Commercial HCV License Verified'}
              </div>
            </div>

            {/* Assigned Assistant / Conductor */}
            <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100 space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-700">
                  Assigned Bus Assistant / Attendant
                </span>
                <span className="text-[10px] font-mono text-emerald-600">
                  {currentAssistant ? currentAssistant.attendanceToday : 'On Duty'}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900">{selectedBus.assistantName}</div>
              <div className="flex items-center gap-1 font-mono text-slate-600 text-[11px] pt-0.5">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{selectedBus.assistantPhone}</span>
              </div>
              <div className="text-[10px] text-slate-500">
                {currentAssistant
                  ? `${currentAssistant.primarySkill} · ${currentAssistant.secondarySkill}`
                  : 'Child Safety, Roster & Boarding In-charge'}
              </div>
            </div>

            {/* Vehicle Specs */}
            <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">License Plate:</span>
                <span className="font-mono font-semibold text-slate-800">{selectedBus.plateNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">GPS Tracker Device:</span>
                <span className="font-mono text-indigo-700">{selectedBus.gpsDeviceId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">RTO Fitness Clearance:</span>
                <span className="font-mono text-slate-800">Valid until {selectedBus.fitnessValidUntil}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Commercial Insurance:</span>
                <span className="font-mono text-slate-800">Valid until {selectedBus.insuranceValidUntil}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Depot Status:</span>
                <span className="font-medium text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {selectedBus.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Route Stops Waypoints & Passenger Student Manifest */}
        <div className="lg:col-span-2 space-y-6">
          {/* Defined Route Stops */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-indigo-600" />
                  Route Stops &amp; Schedule Timings ({selectedBus.stops.length} Stops)
                </h3>
                <p className="text-xs text-slate-500">{selectedBus.routeName}</p>
              </div>

              <button
                onClick={() => setShowAddStopModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Waypoint Stop</span>
              </button>
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-200">
              {selectedBus.stops.map((stop, index) => (
                <div key={stop.id} className="relative flex items-start justify-between text-xs">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-white" />
                  <div>
                    <div className="font-semibold text-slate-900">{stop.stopName}</div>
                    <div className="text-[10px] text-slate-400">Stop #{index + 1}</div>
                  </div>
                  <div className="text-right font-mono text-[11px] space-y-0.5">
                    <div className="text-indigo-700 font-medium">Pickup: {stop.morningPickupTime}</div>
                    <div className="text-slate-500 text-[10px]">Drop: {stop.afternoonDropTime}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Passenger Student Manifest */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Assigned Student Passengers ({passengerStudents.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Students registered on {selectedBus.busNumber} with boarding stops and emergency guardian contacts
                </p>
              </div>
            </div>

            {passengerStudents.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg">
                No students currently assigned to this bus route. Register a student with bus service in the Student Registration tab.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="px-3 py-2">Student</th>
                      <th className="px-3 py-2">Standard</th>
                      <th className="px-3 py-2">Designated Stop</th>
                      <th className="px-3 py-2">Parent Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {passengerStudents.map((stu) => (
                      <tr key={stu.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2.5">
                          <span className="font-semibold text-slate-900">{stu.fullName}</span>
                          <span className="block font-mono text-[10px] text-slate-400">{stu.admissionNo}</span>
                        </td>
                        <td className="px-3 py-2.5 font-medium text-slate-700">
                          Class {stu.grade}-{stu.section}
                        </td>
                        <td className="px-3 py-2.5 text-indigo-700 font-medium">{stu.busStop || 'Main Stop'}</td>
                        <td className="px-3 py-2.5 font-mono text-slate-600">{stu.parentPhone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Bus Modal */}
      {showAddBusModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-semibold text-slate-900">Register New School Bus</h3>
              <button
                onClick={() => setShowAddBusModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBus} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Bus Number Code</label>
                  <input
                    type="text"
                    value={newBusData.busNumber}
                    onChange={(e) => setNewBusData({ ...newBusData, busNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">License Plate No.</label>
                  <input
                    type="text"
                    value={newBusData.plateNumber}
                    onChange={(e) => setNewBusData({ ...newBusData, plateNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Seating Capacity</label>
                  <input
                    type="number"
                    value={newBusData.seatingCapacity}
                    onChange={(e) => setNewBusData({ ...newBusData, seatingCapacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    min={20}
                    max={60}
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Fuel Type</label>
                  <select
                    value={newBusData.fuelType}
                    onChange={(e) => setNewBusData({ ...newBusData, fuelType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="CNG">CNG</option>
                    <option value="Electric">Electric</option>
                    <option value="Diesel">Diesel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Route Name &amp; Description</label>
                <input
                  type="text"
                  value={newBusData.routeName}
                  onChange={(e) => setNewBusData({ ...newBusData, routeName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Assign Driver</label>
                  <select
                    value={newBusData.driverId}
                    onChange={(e) => setNewBusData({ ...newBusData, driverId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.phone})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Assign Bus Assistant</label>
                  <select
                    value={newBusData.assistantId}
                    onChange={(e) => setNewBusData({ ...newBusData, assistantId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {assistants.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.phone})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddBusModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                >
                  Register Bus Fleet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Waypoint Modal */}
      {showAddStopModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-semibold text-slate-900">Add Waypoint Stop to {selectedBus.busNumber}</h3>
              <button
                onClick={() => setShowAddStopModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStopSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Stop / Landmark Name</label>
                <input
                  type="text"
                  value={newStop.stopName}
                  onChange={(e) => setNewStop({ ...newStop, stopName: e.target.value })}
                  placeholder="e.g. Phoenix Mall North Gate"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Morning Pickup Time</label>
                  <input
                    type="text"
                    value={newStop.morningPickupTime}
                    onChange={(e) => setNewStop({ ...newStop, morningPickupTime: e.target.value })}
                    placeholder="07:20 AM"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Afternoon Drop Time</label>
                  <input
                    type="text"
                    value={newStop.afternoonDropTime}
                    onChange={(e) => setNewStop({ ...newStop, afternoonDropTime: e.target.value })}
                    placeholder="03:40 PM"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddStopModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                >
                  Save Waypoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reassign Crew via Skill Matrix Modal */}
      {showReassignCrewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Reassign Crew · {selectedBus.busNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  Select driver and bus escort matching transport &amp; safety skills
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReassignCrewModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCrew} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Assigned Driver (Licensed HCV / HPV)
                </label>
                <select
                  value={draftDriverId}
                  onChange={(e) => setDraftDriverId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.primarySkill} · {d.attendanceToday})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Assigned Bus Assistant / Escort
                </label>
                <select
                  value={draftAssistantId}
                  onChange={(e) => setDraftAssistantId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {assistants.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.primarySkill} · {a.attendanceToday})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowReassignCrewModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold cursor-pointer"
                >
                  Save Crew Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
