const Navbar = () => {
  const loguot = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = '/login';
  };

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  return (
    <div className="flex justify-between items-center bg-gray-100 px-6 py-4">
      <h2 className="text-lg font-semibold">
        {user ? user.name : 'Guest'}
      </h2>
      <button
        className="bg-red-500 text-white px-4 py-2 rounded"
        onClick={loguot}
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
