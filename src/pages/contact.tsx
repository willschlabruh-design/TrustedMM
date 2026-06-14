import Header from '../components/Header';

export default function Contact(){
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-36 container mx-auto px-6 max-w-2xl dark-text">
        <h1 className="text-3xl font-bold">Contact</h1>
        <p className="mt-4">For support, reach out to <a href="mailto:william.schlanbusch@gmail.com" className="underline">william.schlanbusch@gmail.com</a>. For immediate help join our Discord community.</p>
        <section className="mt-6 card-glass">
          <h3 className="font-semibold">Send us a message</h3>
          <div className="form-dark mt-3">
            <form className="space-y-3" onSubmit={async (e)=>{
              e.preventDefault();
              const form = e.currentTarget as HTMLFormElement;
              const email = (form.elements[0] as HTMLInputElement).value;
              const message = (form.elements[1] as HTMLTextAreaElement).value;
              const name = '';
              try{
                const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, name, message }) });
                if(r.ok){ alert('Message sent — admins have been notified.'); form.reset(); }
                else { const j = await r.json(); alert('Error: '+(j.error||r.statusText)); }
              }catch(err){ alert('Network error'); }
            }}>
              <input placeholder="Your email" className="w-full p-3 rounded" required />
              <textarea placeholder="Message" className="w-full p-3 rounded" rows={6} required></textarea>
              <button className="btn-primary px-4 py-2 rounded">Send</button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
