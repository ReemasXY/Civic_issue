import {
  FaMapMarkerAlt,
  FaBell,
  FaCamera
} from "react-icons/fa";

export default function Feature() {
  return (
    <section className="max-w-[1150px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
          <FaMapMarkerAlt
            className="text-slate-700 mb-4"
            size={20}
          />

          <h3 className="font-bold text-slate-900">
            Location Based
          </h3>

          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            Report issues with their exact location so they can reach the
            appropriate department.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
          <FaCamera
            className="text-slate-700 mb-4"
            size={20}
          />

          <h3 className="font-bold text-slate-900">
            Photo Evidence
          </h3>

          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            Attach photos to provide clear evidence and help authorities
            understand the issue.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
          <FaBell
            className="text-slate-700 mb-4"
            size={20}
          />

          <h3 className="font-bold text-slate-900">
            Real-Time Updates
          </h3>

          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            Stay informed about your complaint from submission until
            resolution.
          </p>
        </div>

      </div>

    </section>
  );
}