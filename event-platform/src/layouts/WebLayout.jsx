export default function WebLayout({ children }) {
    return (
      <div>
        <nav className="hidden md:flex">Navbar</nav>
        {children}
        <footer className="hidden md:block">Footer</footer>
      </div>
    );
  }
  