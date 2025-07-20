import React, { useState, useEffect } from "react";
import { addSocialMediaUrl, getAddress } from "../services/api";
import { toast } from "react-toastify";
import * as FaIcons from "react-icons/fa6";

const ContactInfo = () => {
  const [socialMediaUrls, setSocialMediaUrls] = useState([]);
  const [address, setAddress] = useState({});

  const fetchSocials = async () => {
    try {
      const res = await addSocialMediaUrl({ action: "getAll" });
      setSocialMediaUrls(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch social media data");
    }
  };

  const fetchAddress = async () => {
    try {
      const res = await getAddress();
      if (res.data) {
        setAddress(res.data[0]);
        return;
      }
      throw new Error("Address data not found");
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch address data");
    }
  };

  useEffect(() => {
    fetchSocials();
    fetchAddress();
  }, []);

  return (
    <footer className="bg-[#2e4a36] text-[#f3f3f3] py-10 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Contact Info */}
        <div className="space-y-3">
          <h3 className="text-2xl font-semibold text-white">Contact</h3>
          <div
            dangerouslySetInnerHTML={{ __html: address?.address || "" }}
            className="text-gray-300"
          />

          {/* Social Media */}
          <div className="pt-6">
            <h4 className="text-lg font-semibold mb-2 text-white">Follow Us</h4>
            <div className="flex gap-4">
              {socialMediaUrls.map((item) => {
                const IconComponent = FaIcons[`Fa${item.icon}`];
                return (
                  <a
                    key={item._id}
                    href={item.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-[#aadba5] hover:scale-110 transition-transform duration-200"
                    title={item.platform}
                  >
                    {IconComponent ? <IconComponent size={26} /> : null}
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Google Map */}
        {/* Google Map */}
        <div className="max-w-md mx-auto lg:mx-0 rounded-lg overflow-hidden shadow-md border border-[#3f6b50] transition-transform hover:scale-[1.01] duration-300">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30452.123456789012!2d78.414024!3d17.321337!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDE5JzE2LjgiTiA3OMKwMjQnNTAuNSJF!5e0!3m2!1sen!2sin!4v1234567890!5m2!1sen!2sin"
            width="100%"
            height="300"
            className="w-full h-full border-0"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="IIOR Location"
          ></iframe>
        </div>
      </div>
    </footer>
  );
};

export default ContactInfo;
