import logo from '../assets/image_be4763.png'; // Pastikan path ini betul

const Header = () => {
  return (
    <header className="w-full bg-white py-6 flex justify-center items-center shadow-sm border-b border-slate-100">
      <div className="max-w-md w-full px-4 flex justify-center">
        <img 
          src={logo} 
          alt="Perodua Suppliers Association Logo" 
          className="h-14 md:h-16 object-contain"
        />
      </div>
    </header>
  );
};

export default Header;
