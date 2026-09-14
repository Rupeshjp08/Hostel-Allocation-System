import { useEffect, useState } from 'react'
import { Check, ClipboardList, Filter, XCircle } from 'lucide-react'
import {
  approveApplication,
  getApplications,
  rejectApplication,
} from '../../services/applicationService'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Card from '../../components/Card'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal from '../../components/Modal'

export default function ApplicationReview() {
  const [applications, setApplications] = useState([])
  const [statusFilter, setStatusFilter] = useState('Pending')
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState(null)
  const [actionType, setActionType] = useState(null) // 'approve' | 'reject'
  const [remarks, setRemarks] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fetchApps = async () => {
    try {
      setLoading(true)
      const res = await getApplications(statusFilter !== 'All' ? { status: statusFilter } : {})
      setApplications(res.data.data?.applications || [])
    } catch (err) {
      setError(err.message || 'Failed to fetch application list.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApps()
  }, [statusFilter])

  const handleOpenAction = (app, type) => {
    setSelectedApp(app)
    setActionType(type)
    setRemarks('')
  }

  const handleConfirmAction = async () => {
    if (!selectedApp || !actionType) return

    setSubmitting(true)
    try {
      if (actionType === 'approve') {
        await approveApplication(selectedApp._id, { remarks })
      } else {
        await rejectApplication(selectedApp._id, { remarks })
      }
      setSelectedApp(null)
      setActionType(null)
      await fetchApps()
    } catch (err) {
      alert(err.message || `Failed to ${actionType} application.`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <LoadingSpinner label="Loading student applications..." fullScreen />
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Application Review</h1>
          <p className="text-xs text-slate-400">Review student hostel requests and grant approvals</p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-navy-900/80 px-3 py-1.5 text-xs text-slate-300">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent font-medium focus:outline-none text-white"
          >
            <option value="Pending" className="bg-navy-900">Pending Requests</option>
            <option value="Approved" className="bg-navy-900">Approved</option>
            <option value="Rejected" className="bg-navy-900">Rejected</option>
            <option value="All" className="bg-navy-900">All Applications</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
          {error}
        </div>
      )}

      {applications.length === 0 ? (
        <Card>
          <EmptyState
            icon={ClipboardList}
            title="No Applications Found"
            description={`No student applications match the filter "${statusFilter}".`}
          />
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-navy-900/80 uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Student Name</th>
                <th className="px-6 py-4 font-semibold">Roll Number</th>
                <th className="px-6 py-4 font-semibold">Department / Year</th>
                <th className="px-6 py-4 font-semibold">Preferred Hostel</th>
                <th className="px-6 py-4 font-semibold">Room Type</th>
                <th className="px-6 py-4 font-semibold">Reason</th>
                <th className="px-6 py-4 font-semibold">Applied On</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {applications.map((app) => {
                const student = app.student || {}
                const hostel = app.preferredHostel || {}

                return (
                  <tr key={app._id} className="transition hover:bg-white/5">
                    <td className="px-6 py-4 font-semibold text-white">{student.name || 'N/A'}</td>
                    <td className="px-6 py-4 font-mono font-bold text-brand-blue">
                      {student.studentId || student.rollNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {student.department} (Yr {student.year})
                    </td>
                    <td className="px-6 py-4 text-slate-300">{hostel.name || 'N/A'}</td>
                    <td className="px-6 py-4">{app.preferredRoomType}</td>
                    <td className="px-6 py-4 max-w-[180px] text-slate-300">
                      <span className="line-clamp-2" title={app.reason}>
                        {app.reason || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <Badge status={app.status}>{app.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {app.status === 'Pending' ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-emerald-400 hover:bg-emerald-500/20"
                            onClick={() => handleOpenAction(app, 'approve')}
                          >
                            <Check className="h-3.5 w-3.5" />
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleOpenAction(app, 'reject')}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500">Processed</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        title={`${actionType === 'approve' ? 'Approve' : 'Reject'} Student Application`}
      >
        {selectedApp && (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs">
              <p className="font-semibold text-white">
                Student: {selectedApp.student?.name} ({selectedApp.student?.studentId || selectedApp.student?.rollNumber})
              </p>
              <p className="mt-1 text-slate-400">
                Requested: {selectedApp.preferredHostel?.name} • {selectedApp.preferredRoomType} Occupancy
              </p>
              {selectedApp.reason && (
                <p className="mt-1 text-slate-400">
                  Reason: <span className="text-slate-300">{selectedApp.reason}</span>
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="modalRemarks" className="text-xs font-medium text-slate-300">
                Warden Remarks (Optional)
              </label>
              <textarea
                id="modalRemarks"
                rows={3}
                placeholder={
                  actionType === 'approve'
                    ? 'e.g. Application approved. Proceed to room allocation.'
                    : 'e.g. Ineligible for preferred hostel block.'
                }
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-navy-900/80 p-3 text-sm text-slate-100 placeholder-slate-500 focus:border-brand-blue focus:outline-none"
              />
            </div>

            <div className="mt-2 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setSelectedApp(null)}>
                Cancel
              </Button>
              <Button
                variant={actionType === 'approve' ? 'primary' : 'danger'}
                loading={submitting}
                onClick={handleConfirmAction}
              >
                Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
