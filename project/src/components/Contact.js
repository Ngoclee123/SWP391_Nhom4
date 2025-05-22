function Contact({ onOpenModal }) {
  return (
    <section id="contact" className="py-16 bg-blue-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-8">Liên hệ với chúng tôi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-blue-600 mb-4">Thông tin liên hệ</h3>
            <p className="text-gray-700 mb-4">Hãy để chúng tôi hỗ trợ bạn chăm sóc sức khỏe bé yêu!</p>
            <p className="text-gray-600 mb-2"><strong>Email:</strong> support@kidscare.vn</p>
            <p className="text-gray-600 mb-2"><strong>Hotline:</strong> 1900 1234</p>
            <p className="text-gray-600 mb-4"><strong>Địa chỉ:</strong> 123 Đường Sức Khỏe, TP. Hồ Chí Minh</p>
            <button onClick={onOpenModal} className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700">
              Đặt lịch tư vấn
            </button>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-blue-600 mb-4">Bản đồ</h3>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.630770689936!2d106.68028741462194!3d10.762622992319947!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f38f8e132c7%3A0x18c8d1e0e3c2b2b!2sHo%20Chi%20Minh%20City%2C%20Vietnam!5e0!3m2!1sen!2s!4v1698765432109!5m2!1sen!2s"
              className="w-full h-64 rounded-lg shadow-md"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;