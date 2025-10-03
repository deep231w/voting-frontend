import Navbar from "./components/Navbar";

const ProtectedLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
};

export default ProtectedLayout;
