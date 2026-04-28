import Navbar from "../../components/Navbar/Navbar";

export default function AboutPage() {
  return (
    <div>
      <Navbar />
      <main className="container" style={{ paddingTop: "30px" }}>
        <section className="hero">
          <div className="hero-left">
            <h1>About Us</h1>
            <p>
              ISC Playground es una plataforma universitaria para competir,
              aprender y conectar por medio de torneos de videojuegos.
            </p>
            <p>
              Nuestra misión es crear una comunidad gamer saludable con eventos,
              rankings transparentes y experiencias inolvidables.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
