import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-800 min-h-screen text-white p-4">
      <h2 className="text-2xl font-bold mb-6">.</h2>
      <nav className="space-y-4">
        <Link to="/" className="block hover:text-yellow-400"></Link>
        <Link to="/production" className="block hover:text-yellow-400"></Link>
        <Link to="/electrical" className="block hover:text-yellow-400"></Link>
      </nav>
    </div>
  );
}
