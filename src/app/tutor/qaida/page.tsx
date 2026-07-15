import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Qaida Analytics — Teacher Dashboard",
  robots: "noindex",
};

export default function TeacherQaidaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Teacher Dashboard 👩‍🏫</h1>
        <p className="text-sm text-gray-500">Monitor student progress in Noorani Qaida</p>
      </div>

      {/* Placeholder analytics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { icon: "👨‍🎓", label: "Total Students", value: "24", color: "from-blue-400 to-blue-600" },
          { icon: "📖", label: "Avg. Letters Done", value: "14/28", color: "from-green-400 to-emerald-600" },
          { icon: "⚡", label: "Avg. XP", value: "340", color: "from-yellow-400 to-amber-500" },
          { icon: "🔥", label: "Active Today", value: "18", color: "from-orange-400 to-red-500" },
          { icon: "🏆", label: "Badges Awarded", value: "87", color: "from-purple-400 to-purple-600" },
          { icon: "🎮", label: "Games Played", value: "156", color: "from-pink-400 to-rose-600" },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`overflow-hidden rounded-2xl bg-gradient-to-br ${stat.color} p-5 text-white shadow-lg`}
          >
            <div className="text-3xl">{stat.icon}</div>
            <div className="mt-2 text-3xl font-black">{stat.value}</div>
            <div className="text-sm opacity-80">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-3xl bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Student Overview</h2>
        <div className="space-y-3">
          {[
            { name: "Ahmed Ali", letters: 22, xp: 550, streak: 7 },
            { name: "Fatima Hassan", letters: 28, xp: 700, streak: 14 },
            { name: "Omar Ibrahim", letters: 15, xp: 375, streak: 3 },
            { name: "Aisha Mohammed", letters: 8, xp: 200, streak: 1 },
          ].map((student) => (
            <div key={student.name} className="flex items-center gap-4 rounded-2xl bg-gray-50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 font-bold text-white">
                {student.name[0]}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{student.name}</div>
                <div className="flex gap-3 text-xs text-gray-500">
                  <span>📖 {student.letters}/28</span>
                  <span>⚡ {student.xp} XP</span>
                  <span>🔥 {student.streak}d</span>
                </div>
              </div>
              <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                  style={{ width: `${(student.letters / 28) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
