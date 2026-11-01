import { Link } from 'react-router'
import { Avatar } from '../components/ui/Avatar'
import { Brand } from '../components/ui/Brand'
import { Icon } from '../components/ui/Icon'
import { ThemeToggle } from '../components/ui/ThemeToggle'

export default function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-header-inner">
          <Brand />
          <nav className="landing-nav" aria-label="Main navigation">
            <a href="#why-nexora">Why Nexora</a>
            <a href="#community">Community</a>
            <a href="#about">Our approach</a>
          </nav>
          <div className="landing-actions">
            <ThemeToggle />
            <Link className="header-login" to="/login">Log in</Link>
            <Link className="button button-dark button-small" to="/signup">
              Join Nexora <Icon name="arrow" size={15} />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> A network with more meaning</div>
            <h1>Good things happen <span>when we connect.</span></h1>
            <p className="hero-description">
              Make room for the people, ideas, and opportunities that move you forward.
              Your next meaningful connection starts here.
            </p>
            <div className="hero-actions">
              <Link className="button button-dark" to="/signup">
                Find your people <Icon name="arrow" size={17} />
              </Link>
              <a className="text-link" href="#why-nexora">
                Get to know Nexora <span aria-hidden="true">↓</span>
              </a>
            </div>
            <div className="social-proof">
              <div className="avatar-stack" aria-hidden="true">
                <Avatar initials="AM" tone="peach" size="small" />
                <Avatar initials="JR" tone="lavender" size="small" />
                <Avatar initials="SK" tone="blue" size="small" />
                <Avatar initials="TL" tone="yellow" size="small" />
              </div>
              <p><strong>A little more human.</strong><br />A lot more possibility.</p>
            </div>
          </div>

          <div className="hero-art" aria-label="Preview of the Nexora community feed">
            <div className="hero-orbit hero-orbit-one" />
            <div className="hero-orbit hero-orbit-two" />
            <div className="hero-sun" />
            <div className="floating-note note-top">
              <span className="note-icon"><Icon name="sparkle" size={17} /></span>
              <span><strong>Small world.</strong><br />Big possibilities.</span>
            </div>
            <article className="preview-card">
              <div className="preview-topline">
                <span className="preview-label"><span /> YOUR COMMUNITY</span>
                <Icon name="globe" size={17} />
              </div>
              <div className="preview-author">
                <Avatar initials="MC" tone="peach" />
                <div><strong>Maya Chen</strong><span>Product designer · 2h</span></div>
                <button className="icon-button" aria-label="More post options">···</button>
              </div>
              <p className="preview-message">
                The best work rarely happens alone. Grateful for the people who make
                the messy middle feel possible. <span>#buildingtogether</span>
              </p>
              <div className="preview-artwork">
                <span className="art-sun" />
                <span className="art-hill art-hill-back" />
                <span className="art-hill art-hill-front" />
                <span className="art-caption">MAKE SPACE<br />FOR WHAT'S NEXT</span>
              </div>
              <div className="preview-reactions">
                <span className="reaction-bubbles"><i>♥</i><i>✦</i></span>
                <span>28 thoughtful reactions</span>
              </div>
              <div className="preview-divider" />
              <div className="preview-footer">
                <span><Icon name="heart" size={17} /> Appreciate</span>
                <span><Icon name="comment" size={17} /> Join in</span>
                <span><Icon name="bookmark" size={17} /></span>
              </div>
            </article>
            <div className="floating-note note-bottom">
              <span className="note-avatar">J</span>
              <span><strong>A new connection</strong><br />is closer than you think</span>
              <Icon name="arrow" size={16} />
            </div>
            <span className="art-sparkle sparkle-one">✳</span>
            <span className="art-sparkle sparkle-two">✳</span>
          </div>
        </section>

        <section className="trust-strip" id="community">
          <span>HERE FOR THE NEXT CHAPTER</span>
          <div className="trust-words"><span>Curious minds</span><i /> <span>Kind people</span><i /> <span>Good work</span><i /> <span>Real connections</span></div>
        </section>

        <section className="why-section" id="why-nexora">
          <div className="section-heading">
            <span className="section-kicker">A different kind of social</span>
            <h2>Less noise.<br /><span>More of what matters.</span></h2>
            <p>Not another feed to keep up with. A place to find your people and make progress together.</p>
          </div>
          <div className="feature-grid">
            <article className="feature-card feature-card-green">
              <span className="feature-icon"><Icon name="users" size={21} /></span>
              <span className="feature-number">01 / PEOPLE</span>
              <h3>Find your kind of people.</h3>
              <p>Meet thoughtful people who share your interests, values, and appetite for what’s next.</p>
              <span className="feature-arrow"><Icon name="arrow" size={17} /></span>
            </article>
            <article className="feature-card feature-card-lilac">
              <span className="feature-icon"><Icon name="sparkle" size={21} /></span>
              <span className="feature-number">02 / IDEAS</span>
              <h3>Share what you’re figuring out.</h3>
              <p>Trade perspectives, celebrate the little wins, and learn in the open—together.</p>
              <span className="feature-arrow"><Icon name="arrow" size={17} /></span>
            </article>
            <article className="feature-card feature-card-peach">
              <span className="feature-icon"><Icon name="compass" size={21} /></span>
              <span className="feature-number">03 / GROWTH</span>
              <h3>Let good things find you.</h3>
              <p>Build the relationships that open doors to work and opportunities worth showing up for.</p>
              <span className="feature-arrow"><Icon name="arrow" size={17} /></span>
            </article>
          </div>
        </section>

        <section className="manifesto-section" id="about">
          <div className="manifesto-mark"><span /><span /></div>
          <p>We believe your network should feel less like a numbers game and more like <em>a good conversation.</em></p>
          <Link className="manifesto-link" to="/signup">Come see what we mean <Icon name="arrow" size={16} /></Link>
        </section>

        <section className="join-section" id="join">
          <div>
            <span className="section-kicker">YOUR PEOPLE ARE OUT THERE</span>
            <h2>Make your next<br />connection <em>count.</em></h2>
          </div>
          <div className="join-action">
            <p>Start with a hello. See where it takes you.</p>
            <Link className="button button-light" to="/signup">Explore Nexora <Icon name="arrow" size={17} /></Link>
            <span>Free to join · Here for the long run</span>
          </div>
          <span className="join-decoration join-decoration-one" />
          <span className="join-decoration join-decoration-two" />
        </section>
      </main>

      <footer className="landing-footer">
        <Brand />
        <span>Make meaningful connections.</span>
        <span>© 2026 Nexora. Made for what’s next.</span>
      </footer>
    </div>
  )
}
