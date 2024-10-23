import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-10">
      <div className="container mx-auto px-6 md:grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Column 1: Logo and Description */}
        <div>
          <h2 className="text-3xl font-bold mb-4">YourBrand</h2>
          <p className="text-gray-400">Empowering your digital journey with excellence and innovation.</p>
        </div>

        {/* Column 2: Links */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2">
            <li><a href="#" className="text-gray-400 hover:text-white transition">Home</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition">About</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition">Services</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition">Contact</a></li>
          </ul>
        </div>

        {/* Column 3: Social Media */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Follow Us</h3>
          <ul className="space-y-2">
            <li><a href="#" className="text-gray-400 hover:text-white transition">Facebook</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition">Twitter</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition">LinkedIn</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition">Instagram</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-10 border-t border-gray-800 pt-6 text-center text-gray-500">
        <p>&copy; 2024 YourBrand. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
