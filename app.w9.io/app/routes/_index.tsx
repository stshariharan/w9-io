import { UserIcon } from "@heroicons/react/24/outline";

export default function Dashboard() {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <UserIcon className="w-6 h-6" /> Dashboard
      </h2>
      <p>Welcome</p>
    </div>
  );
}
