import { User } from "@/types";

interface Props {
  users: User[];
}

const LeaderBoard: React.FC<Props> = ({ users }) => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Leaderboard</h2>
      <ul className="bg-white rounded-lg shadow">
        {users.map((user, index) => (
          <li key={index} className="px-4 py-2 border-b last:border-b-0">
            <span className="font-semibold">{user.username}:</span> {user.score}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LeaderBoard;
