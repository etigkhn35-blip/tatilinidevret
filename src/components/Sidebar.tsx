export default function Sidebar() {
  const categories = [
    "Konaklama",
    "Villa / Yazlık",
    "Turlar",
    "Etkinlik Paketleri",
    "Tekne / Yat",
    "Kamp & Glamping",
    "Wellness & Spa",
    "Yoga / Retreat",
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Kategoriler</h2>
      <ul className="space-y-2">
        {categories.map((cat) => (
          <li
            key={cat}
            className="text-gray-700 hover:text-blue-600 cursor-pointer font-medium"
          >
            {cat}
          </li>
        ))}
      </ul>
    </aside>
  );
}
