import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, FileText, XCircle } from 'lucide-react'
import { cancelApplication, getMyApplications } from '../../services/applicationService'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Card from '../../components/Card'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function MyApplication() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState(null)
  const [error, setError] = useState('')

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const res = await getMyApplications()
      setApplications(res.data.data?.applications || [])
    } catch (err) {
      setError(err.message || 'Failed to fetch application records.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this application?')) return

    try {
      setCancellingId(id)
      await cancelApplication(id)
      await fetchApplications()
    } catch (err) {
      alert(err.message || 'Failed to cancel application')
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) {
    return <LoadingSpinner label="Loading your application details..." fullScreen />
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">My Application Status</h1>
          <p className="text-xs text-slate-400">View and track your active hostel room request</p>
        </div>
        <Link to="/student/apply">
          <Button variant="primary" size="sm">
            <FileText className="h-4 w-4" />
            New Application
          </Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
          {error}
        </div>
      )}

      {applications.length === 0 ? (
        <Card>
          <EmptyState
            title="No Application Found"
            description="You have not submitted any hostel applications yet."
            action={
              <Link to="/student/apply">
                <Button variant="primary">Submit Application</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {applications.map((app) => (
            <Card key={app._id} className="transition hover:border-white/20">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-white">
                      {app.preferredHostel?.name || 'Preferred Hostel'}
                    </h3>
                    <Badge status={app.status}>{app.status}</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-400">
                    <span>
                      Room Type: <strong className="text-slate-200">{app.preferredRoomType} Occupancy</strong>
                    </span>
                    <span>
                      Submitted: <strong className="text-slate-200">{new Date(app.createdAt).toLocaleDateString()}</strong>
                    </span>
                    <span>
                      Hostel Type: <strong className="text-slate-200">{app.preferredHostel?.type || 'N/A'}</strong>
                    </span>
                  </div>
                  {app.reason && (
                    <p className="mt-2 text-xs text-slate-400">
                      Reason: <span className="text-slate-300">{app.reason}</span>
                    </p>
                  )}
                </div>

                {app.status === 'Pending' && (
                  <Button
                    variant="danger"
                    size="sm"
                    loading={cancellingId === app._id}
                    onClick={() => handleCancel(app._id)}
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel Request
                  </Button>
                )}
              </div>

              {app.remarks && (
                <div className="mt-4 rounded-xl border border-white/5 bg-navy-900/60 p-3 text-xs text-slate-300">
                  <span className="font-semibold text-slate-200">Warden Remarks:</span> {app.remarks}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
