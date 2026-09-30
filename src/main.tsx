import React, {useEffect, useMemo, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {
  ArrowDown,
  Camera,
  Code2,
  ExternalLink,
  Github,
  Keyboard,
  Layers,
  Menu,
  Minus,
  Monitor,
  Mountain,
  Plus,
  Sparkles,
  X,
} from 'lucide-react';
import './style.css';
import { profile, galleryPhotos } from './content';

// folio_HOSTING_FIX_1
class SceneSafety extends React.Component<{children:React.ReactNode}, {failed:boolean}> {
  state = {failed:false};
  static getDerivedStateFromError() { return {failed:true}; }
  render() { return this.state.failed ? null : this.props.children; }
}
function WebGLGuard() {
  const {gl} = useThree();
  const [lost, setLost] = useState(false);
  useEffect(() => {
    const canvas = gl.domElement;
    const onLost = (event:Event) => { event.preventDefault(); setLost(true); };
    canvas.addEventListener('webglcontextlost', onLost);
    return () => canvas.removeEventListener('webglcontextlost', onLost);
  }, [gl]);
  if (lost) throw new Error('WebGL context lost');
  return null;
}
function introSeen() {
  try { return sessionStorage.getItem('folio-intro-seen') === 'true'; }
  catch { return false; }
}
const repository = profile.repository;
const photos = galleryPhotos;

type PointerRef = React.MutableRefObject<{x:number; y:number}>;

function Magnetic({children, className = ''}:{children:React.ReactNode; className?:string}) {
  const ref = useRef<HTMLSpanElement>(null);
  const move = (event: React.PointerEvent<HTMLSpanElement>) => {
    if (event.pointerType !== 'mouse' || document.documentElement.dataset.motion === 'off') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * .12;
    const y = (event.clientY - rect.top - rect.height / 2) * .12;
    ref.current?.style.setProperty('--mx', `${x}px`);
    ref.current?.style.setProperty('--my', `${y}px`);
  };
  const reset = () => {
    ref.current?.style.setProperty('--mx', '0px');
    ref.current?.style.setProperty('--my', '0px');
  };
  return <span ref={ref} className={`magnetic ${className}`} onPointerMove={move} onPointerLeave={reset}>{children}</span>;
}

function Tilt({children, className = ''}:{children:React.ReactNode; className?:string}) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'off') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    ref.current?.style.setProperty('--rx', `${-(py - .5) * 11}deg`);
    ref.current?.style.setProperty('--ry', `${(px - .5) * 11}deg`);
    ref.current?.style.setProperty('--gx', `${px * 100}%`);
    ref.current?.style.setProperty('--gy', `${py * 100}%`);
  };
  const reset = () => {
    ref.current?.style.setProperty('--rx', '0deg');
    ref.current?.style.setProperty('--ry', '0deg');
    ref.current?.style.setProperty('--gx', '50%');
    ref.current?.style.setProperty('--gy', '50%');
  };
  return <div ref={ref} className={`tilt ${className}`} onPointerMove={move} onPointerLeave={reset}>
    {children}
    <span className="tilt-glare" aria-hidden="true" />
  </div>;
}

function ParticleCloud({motion}:{motion:boolean}) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const data = new Float32Array(180 * 3);
    for (let i = 0; i < 180; i += 1) {
      const radius = 3.6 + Math.random() * 4.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      data[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      data[i * 3 + 1] = radius * Math.cos(phi) * .55;
      data[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    return data;
  }, []);

  useFrame((state, delta) => {
    if (!points.current) return;
    if (motion) {
      points.current.rotation.y += delta * .02;
      points.current.rotation.x = Math.sin(state.clock.elapsedTime * .18) * .08;
    }
  });

  return <points ref={points}>
    <bufferGeometry>
      <bufferAttribute attach="attributes-position" args={[positions, 3]} />
    </bufferGeometry>
    <pointsMaterial color="#ced9ff" size={.05} sizeAttenuation transparent opacity={.85} depthWrite={false} />
  </points>;
}

function OrbitalObject({motion, pointer, variant = 'hero'}:{motion:boolean; pointer:PointerRef; variant?:'hero'|'intro'}) {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);
  const basePos = variant === 'hero'
    ? {x:1.95, y:.15, z:0}
    : {x:0, y:.1, z:0};
  const amplitude = variant === 'hero'
    ? {rx:.28, ry:.42, px:.35, py:.22}
    : {rx:.45, ry:.58, px:.22, py:.18};

  useFrame((state, delta) => {
    if (!group.current || !core.current || !inner.current) return;
    const targetX = pointer.current.y * amplitude.rx;
    const targetY = pointer.current.x * amplitude.ry;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, .05);
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetY, .05);
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, basePos.x + pointer.current.x * amplitude.px, .04);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, basePos.y + pointer.current.y * amplitude.py, .04);
    group.current.position.z = basePos.z;
    if (motion) {
      group.current.rotation.z += delta * (variant === 'hero' ? .055 : .08);
      core.current.rotation.x += delta * .11;
      core.current.rotation.y -= delta * .08;
      inner.current.rotation.y -= delta * .22;
      inner.current.rotation.x += delta * .12;
    }
    const breathe = motion ? 1 + Math.sin(state.clock.elapsedTime * (variant === 'hero' ? .75 : .95)) * .03 : 1;
    group.current.scale.setScalar(variant === 'hero' ? breathe : breathe * 1.08);
  });

  return <group ref={group} position={[basePos.x, basePos.y, basePos.z]} rotation={[.3, -.4, .08]}>
    <mesh ref={inner}>
      <octahedronGeometry args={[.82, 0]} />
      <meshPhysicalMaterial color="#f2f5ff" roughness={.18} metalness={.15} transparent opacity={.95} emissive="#5671d8" emissiveIntensity={.2} />
    </mesh>
    <mesh ref={core}>
      <icosahedronGeometry args={[variant === 'hero' ? 1.48 : 1.82, 1]} />
      <meshPhysicalMaterial color="#8098f3" roughness={.4} metalness={.35} wireframe transparent opacity={variant === 'hero' ? .23 : .28} />
    </mesh>
    <mesh rotation={[Math.PI / 2.6, .3, .2]}>
      <torusGeometry args={[variant === 'hero' ? 2.05 : 2.42, .015, 8, 180]} />
      <meshBasicMaterial color="#b7c5ff" transparent opacity={.35} />
    </mesh>
    <mesh rotation={[.35, Math.PI / 2.2, -.2]}>
      <torusGeometry args={[variant === 'hero' ? 1.73 : 2.1, .011, 8, 160]} />
      <meshBasicMaterial color="#7184c9" transparent opacity={.26} />
    </mesh>
    <mesh position={[-1.38, .55, .32]}>
      <sphereGeometry args={[.08, 16, 16]} />
      <meshBasicMaterial color="#d8e0ff" />
    </mesh>
    <mesh position={[1.65, -.32, -.2]}>
      <sphereGeometry args={[.055, 16, 16]} />
      <meshBasicMaterial color="#8ba1ff" />
    </mesh>
  </group>;
}

function CameraDrift({motion, pointer, intensity = 1}:{motion:boolean; pointer:PointerRef; intensity?:number}) {
  const {camera} = useThree();
  const base = useRef(camera.position.clone());

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    const idleX = motion
      ? Math.sin(time * .17) * .075 * intensity
      : 0;

    const idleY = motion
      ? Math.cos(time * .13) * .055 * intensity
      : 0;

    const idleZ = motion
      ? Math.sin(time * .11) * .045 * intensity
      : 0;

    const targetX =
      base.current.x +
      idleX +
      pointer.current.x * .09 * intensity;

    const targetY =
      base.current.y +
      idleY +
      pointer.current.y * .065 * intensity;

    const targetZ =
      base.current.z +
      idleZ;

    camera.position.x = THREE.MathUtils.lerp(
      camera.position.x,
      targetX,
      .025
    );

    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      targetY,
      .025
    );

    camera.position.z = THREE.MathUtils.lerp(
      camera.position.z,
      targetZ,
      .025
    );

    camera.lookAt(0, 0, 0);

    camera.rotation.z = THREE.MathUtils.lerp(
      camera.rotation.z,
      pointer.current.x * -.006 * intensity,
      .02
    );
  });

  return null;
}
function HeroScene({motion, pointer}:{motion:boolean; pointer:PointerRef}) {
  return <div className="hero-scene" aria-hidden="true">
    <Canvas fallback={<span />} frameloop={motion ? "always" : "demand"} camera={{position:[0, 0, 7], fov:46}} dpr={[1, 1.5]} gl={{alpha:true, antialias:true, powerPreference:'high-performance'}}>
      <WebGLGuard />
      <CameraDrift motion={motion} pointer={pointer} />
      <ambientLight intensity={1.1} />
      <pointLight position={[4, 3, 5]} intensity={8} color="#9fb3ff" />
      <pointLight position={[-4, -2, 3]} intensity={4} color="#4f649f" />
      <OrbitalObject motion={motion} pointer={pointer} variant="hero" />
    </Canvas>
  </div>;
}

function IntroScene({motion, pointer}:{motion:boolean; pointer:PointerRef}) {
  return <div className="intro-scene" aria-hidden="true">
    <Canvas fallback={<span />} frameloop={motion ? "always" : "demand"} camera={{position:[0, 0, 8], fov:38}} dpr={[1, 1.5]} gl={{alpha:true, antialias:true, powerPreference:'high-performance'}}>
      <WebGLGuard />
      <CameraDrift motion={motion} pointer={pointer} intensity={.7} />
      <fog attach="fog" args={['#080b12', 7, 16]} />
      <ambientLight intensity={1.45} />
      <pointLight position={[3, 2, 4]} intensity={10} color="#b2c1ff" />
      <pointLight position={[-3, -1, 5]} intensity={4.5} color="#5d73c8" />
      <spotLight position={[0, 4, 2]} intensity={12} angle={.45} penumbra={1} color="#edf1ff" />
      <ParticleCloud motion={motion} />
      <OrbitalObject motion={motion} pointer={pointer} variant="intro" />
    </Canvas>
  </div>;
}

function IntroOverlay({motion, closing, onFinish}:{motion:boolean; closing:boolean; onFinish:() => void}) {
  const pointer = useRef({x:0, y:0});

  useEffect(() => {
    if (closing) return;
    const timer = window.setTimeout(onFinish, 6500);
    return () => window.clearTimeout(timer);
  }, [closing, onFinish]);

  useEffect(() => {
    if (closing) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onFinish();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closing, onFinish]);

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || !motion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointer.current.x = ((event.clientX - rect.left) / rect.width - .5) * 2;
    pointer.current.y = -(((event.clientY - rect.top) / rect.height - .5) * 2);
  };
  const onPointerLeave = () => { pointer.current = {x:0, y:0}; };
  const title = (profile.brand + '.').split('');

  return <div className={`intro-overlay ${closing ? 'closing' : ''}`} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} role="dialog" aria-label={`${profile.brand} cinematic intro`}>
    <div className="intro-filmbar intro-filmbar-top" aria-hidden="true" />
    <div className="intro-filmbar intro-filmbar-bottom" aria-hidden="true" />
    <div className="intro-noise" aria-hidden="true" />
    <div className="intro-grid" aria-hidden="true" />
    <div className="intro-vignette" aria-hidden="true" />
    <div className="intro-scan" aria-hidden="true" />
    <SceneSafety><IntroScene motion={motion} pointer={pointer} /></SceneSafety>
    <div className="intro-portal" aria-hidden="true"><span/><span/><span/></div>
    <div className="intro-content">
      <p className="intro-eyebrow">A {profile.brand} DIGITAL EXPERIENCE</p>
      <h1 className="intro-title" aria-label={profile.brand}>
        {title.map((letter, index) => <span key={`${letter}-${index}`} style={{'--i':index} as React.CSSProperties}>{letter}</span>)}
      </h1>
      <div className="intro-rule" aria-hidden="true" />
      <p className="intro-identity">{profile.fullName}</p>
      <p className="intro-subtitle">Informatics student · developer · creative explorer</p>
      <div className="intro-roleline" aria-hidden="true"><span>CODE</span><i>×</i><span>VISUAL</span><i>×</i><span>STORIES</span></div>
      <div className="intro-status"><span className="status-dot"/> Initializing portfolio experience</div>
      <div className="intro-progress" aria-hidden="true"><span/></div>
      <p className="intro-hint">Move your cursor · press Enter to continue</p>
    </div>
    <div className="intro-actions">
      <button type="button" className="intro-link" onClick={onFinish}>Skip intro</button>
      <button type="button" className="intro-enter" onClick={onFinish}>Enter site <ArrowDown size={14}/></button>
    </div>
    <span className="intro-corner intro-corner-left">CINEMATIC 3D INTRO / V4</span>
    <span className="intro-corner intro-corner-right">{profile.location}</span>
  </div>;
}


// === V6 DEMO CASE STUDY START ===
function DemoCaseStudy({
  open,
  onClose,
}:{
  open:boolean;
  onClose:() => void;
}) {

  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const node = panel.current;
    if (!node) return;
    const selector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const items = () => Array.from(node.querySelectorAll<HTMLElement>(selector)).filter(el => el.getClientRects().length > 0);
    const frame = requestAnimationFrame(() => items()[0]?.focus({preventScroll:true}));
    const trap = (event:KeyboardEvent) => {
      if(event.key !== 'Tab') return;
      const list = items();
      const first = list[0], last = list[list.length - 1];
      if(!first) { event.preventDefault(); return; }
      if(!node.contains(document.activeElement)) {
        event.preventDefault(); (event.shiftKey ? last : first).focus();
      } else if(event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if(!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener('keydown', trap, true);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', trap, true);
      if(previous?.isConnected) previous.focus({preventScroll:true});
    };
  }, [open]);

  useEffect(() => {

    if (!open) return;

    panel.current?.scrollTo({
      top:0,
      behavior:'auto',
    });

    document.body.classList.add(
      'case-study-active'
    );

    const previousTitle =
      document.title;

    document.title =
      'Demo Coffee — ' + profile.brand;


    const onKey = (
      event:KeyboardEvent
    ) => {

      if (event.key === 'Escape') {
        onClose();
      }

    };


    window.addEventListener(
      'keydown',
      onKey
    );


    return () => {

      document.body.classList.remove(
        'case-study-active'
      );

      document.title =
        previousTitle;

      window.removeEventListener(
        'keydown',
        onKey
      );

    };

  }, [open]);


  if (!open) return null;


  const flow = [
    'Kasir',
    'Transaksi',
    'Reservasi stok',
    'Pembayaran',
    'Settlement',
    'Laporan',
  ];


  const stack = [
    'Laravel',
    'PHP',
    'MySQL',
    'Tailwind CSS',
    'Alpine.js',
    'Midtrans',
    'PHPUnit',
  ];


  const onCaseScroll = (
    event:React.UIEvent<HTMLDivElement>
  ) => {

    const node =
      event.currentTarget;

    const max =
      node.scrollHeight -
      node.clientHeight;

    const progress =
      max > 0
        ? Math.min(
            100,
            Math.max(
              0,
              node.scrollTop /
              max *
              100
            )
          )
        : 0;


    node.style.setProperty(
      '--case-progress',
      `${progress}%`
    );

  };


  return (
    <div
      ref={panel}
      className="case-study-page"
      role="dialog"
      aria-modal="true"
      aria-label="Case study Demo Coffee"
      onScroll={onCaseScroll}
    >

      <div
        className="case-study-progress"
        aria-hidden="true"
      >
        <span />
      </div>


      <header className="case-study-nav">

        <button
          type="button"
          className="case-back"
          onClick={onClose}
        >
          <X size={17}/>
          Tutup case study
        </button>


        <span className="case-study-mark">
          {profile.brand} / CASE STUDY 01
        </span>


        {repository && (<a
          href={repository}
          target="_blank"
          rel="noreferrer"
        >
          GitHub
          <ExternalLink size={14}/>
        </a>)}

      </header>


      <div className="case-study-main">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="case-study-hero">

          <div className="case-study-kicker">
            <span>DEMO CASE STUDY</span>
            <span>2026</span>
          </div>


          <h2>
            Demo Coffee.
          </h2>


          <p className="case-study-lead">
            Satu sistem operasional kedai untuk transaksi
            kasir, stok, pembayaran, laporan, dan kontrol
            akses tiga role.
          </p>


          <div className="case-study-metrics">

            <div>
              <strong>42</strong>
              <span>menu dikelola</span>
            </div>

            <div>
              <strong>3</strong>
              <span>role pengguna</span>
            </div>

            <div>
              <strong>QRIS</strong>
              <span>Midtrans sandbox</span>
            </div>

            <div>
              <strong>POS</strong>
              <span>stok terintegrasi</span>
            </div>

          </div>


          {/* PRODUCT MOCKUP */}

          <div
            className="case-product-frame"
            aria-label="Ilustrasi antarmuka POS Demo Coffee"
          >

            <div className="case-product-bar">

              <span>
                DEMO / POS
              </span>

              <span>
                Kasir · Shift aktif
              </span>

            </div>


            <div className="case-product-body">

              <aside>

                <b>DEMO</b>

                <span className="is-active">
                  Kasir
                </span>

                <span>
                  Transaksi
                </span>

                <span>
                  Stok
                </span>

                <span>
                  Riwayat
                </span>

              </aside>


              <div className="case-menu-mock">

                <div className="case-mock-head">
                  <span>Menu</span>
                  <i/>
                </div>


                <div className="case-menu-grid">

                  {[
                    'Americano',
                    'Cappuccino',
                    'Cafe Latte',
                    'Manual Brew',
                    'Matcha',
                    'Chocolate',
                  ].map(
                    (item, index) => (

                      <div key={item}>

                        <span>
                          {String(index + 1)
                            .padStart(2,'0')}
                        </span>

                        <b>
                          {item}
                        </b>

                        <small>
                          stok tersedia
                        </small>

                      </div>

                    )
                  )}

                </div>

              </div>


              <div className="case-cart-mock">

                <span>
                  ORDER / #024
                </span>

                <h3>
                  Pesanan
                </h3>


                <p>
                  <b>2×</b>
                  Cappuccino
                </p>

                <p>
                  <b>1×</b>
                  Matcha
                </p>


                <div className="case-cart-total">

                  <span>
                    Total
                  </span>

                  <strong>
                    Rp 65.000
                  </strong>

                </div>


                <span className="case-pay-mock">
                  Bayar dengan QRIS
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            CONTEXT
        ================================================= */}

        <section className="case-story-grid">

          <article>

            <span className="case-index">
              01 / CONTEXT
            </span>

            <h3>
              Masalah yang ingin diselesaikan.
            </h3>

            <p>
              Operasional kedai membutuhkan alur yang
              konsisten antara pencatatan transaksi,
              perubahan stok, status pembayaran, dan
              laporan. Ketika bagian-bagian ini berjalan
              sendiri-sendiri, risiko data tidak sinkron
              ikut meningkat.
            </p>

          </article>


          <article>

            <span className="case-index">
              02 / DIRECTION
            </span>

            <h3>
              Satu alur, tiga role.
            </h3>

            <p>
              Aplikasi dibentuk sebagai satu pusat kerja
              untuk Owner, Admin, dan Kasir. Setiap role
              melihat fitur yang relevan tanpa
              menghilangkan satu sumber data transaksi
              dan stok yang sama.
            </p>

          </article>

        </section>


        {/* =================================================
            SYSTEM FLOW
        ================================================= */}

        <section className="case-flow-section">

          <div className="case-section-copy">

            <span className="case-index">
              03 / SYSTEM FLOW
            </span>

            <h3>
              Dari klik “bayar” sampai stok
              benar-benar aman.
            </h3>

            <p>
              Alur pembayaran diperlakukan sebagai
              proses, bukan sekadar tombol. Stok
              direservasi, status pembayaran
              diverifikasi, settlement mengonsumsi
              stok sekali, sementara transaksi gagal
              atau kedaluwarsa melepas reservasi.
            </p>

          </div>


          <div
            className="case-flow"
            aria-label="Alur sistem Demo Coffee"
          >

            {flow.map(
              (item, index) => (

                <React.Fragment key={item}>

                  <div>

                    <span>
                      {String(index + 1)
                        .padStart(2,'0')}
                    </span>

                    <b>
                      {item}
                    </b>

                  </div>


                  {index < flow.length - 1 && (

                    <i aria-hidden="true">
                      →
                    </i>

                  )}

                </React.Fragment>

              )
            )}

          </div>

        </section>


        {/* =================================================
            CONTRIBUTION
        ================================================= */}

        <section className="case-contribution">

          <div className="case-section-copy">

            <span className="case-index">
              04 / CONTRIBUTION
            </span>

            <h3>
              Contoh bagian kontribusi
              dalam proyek.
            </h3>

          </div>


          <div className="case-contribution-grid">

            <article>

              <Code2/>

              <span>
                01
              </span>

              <h4>
                Payment integration
              </h4>

              <p>
                Integrasi Midtrans sandbox dan
                penguatan akses token pembayaran
                berdasarkan transaksi serta kasir
                yang berhak.
              </p>

            </article>


            <article>

              <Layers/>

              <span>
                02
              </span>

              <h4>
                Stock integrity
              </h4>

              <p>
                Reservasi stok, release pada
                pembayaran gagal, dan perlindungan
                agar settlement berulang tidak
                mengonsumsi stok dua kali.
              </p>

            </article>


            <article>

              <Monitor/>

              <span>
                03
              </span>

              <h4>
                POS experience
              </h4>

              <p>
                Penyempurnaan tampilan kasir,
                status stok, foto menu, popup
                nama pelanggan, dan checkout guard.
              </p>

            </article>

          </div>

        </section>


        {/* =================================================
            VALIDATION
        ================================================= */}

        <section className="case-validation">

          <div className="case-section-copy">

            <span className="case-index">
              05 / VALIDATION
            </span>

            <h3>
              Bukan hanya “jalan”.
              Contoh rencana uji.
            </h3>

            <p>
              Pengujian difokuskan pada titik
              yang paling berisiko merusak
              histori transaksi atau stok.
            </p>

          </div>


          <div className="case-test-grid">

            <article>

              <span>
                PAYMENT
              </span>

              <strong>
                Token hardening
              </strong>

              <p>
                Conflict state, kegagalan provider,
                dan pembatasan akses kasir
                untuk diverifikasi.
              </p>

            </article>


            <article>

              <span>
                STOCK
              </span>

              <strong>
                Reservation lifecycle
              </strong>

              <p>
                Pending menahan stok; expire,
                cancel, deny, dan failure
                melepaskannya kembali.
              </p>

            </article>


            <article>

              <span>
                CONCURRENCY
              </span>

              <strong>
                Race-condition check
              </strong>

              <p>
                Dua proses bersamaan diuji agar
                stok terakhir hanya dapat
                dimenangkan satu transaksi.
              </p>

            </article>

          </div>

        </section>


        {/* =================================================
            STACK
        ================================================= */}

        <section className="case-stack">

          <div>

            <span className="case-index">
              06 / STACK
            </span>

            <h3>
              Teknologi yang dipakai.
            </h3>

          </div>


          <div className="case-stack-list">

            {stack.map(
              item => (
                <span key={item}>
                  {item}
                </span>
              )
            )}

          </div>

        </section>


        {/* =================================================
            OUTRO
        ================================================= */}

        <section className="case-study-outro">

          <span>
            CASE STUDY / 01
          </span>


          <h3>
            Build. Test.
            <br/>

            <em>
              Refine.
            </em>
          </h3>


          <div className="case-outro-actions">

            {repository && (<a
              className="button blue"
              href={repository}
              target="_blank"
              rel="noreferrer"
            >

              <Github size={18}/>

              Lihat repository

            </a>)}


            <button
              type="button"
              className="case-back-bottom"
              onClick={onClose}
            >
              Kembali ke portfolio
            </button>

          </div>

        </section>

      </div>

    </div>
  );
}
// === V6 DEMO CASE STUDY END ===

function App() {
  const prefersReduced = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  const [menu, setMenu] = useState(false);
  const [motion, setMotion] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [detail, setDetail] = useState(false);
  const [caseStudy, setCaseStudy] = useState(false);
  const [photo, setPhoto] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState('home');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showIntro, setShowIntro] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches && !introSeen());
  const [introClosing, setIntroClosing] = useState(false);
  const modal = useRef<HTMLDialogElement>(null);
  const heroPointer = useRef({x:0, y:0});
  const navItems = useMemo(() => [
    ['about', 'Tentang'],
    ['work', 'Proyek'],
    ['journey', 'Di luar layar'],
  ] as const, []);

  useEffect(() => {
    document.documentElement.dataset.motion = motion ? 'on' : 'off';
  }, [motion]);

  useEffect(() => {
    if (!motion && showIntro) {
      setShowIntro(false);
      setIntroClosing(false);
    }
  }, [motion, showIntro]);

  useEffect(() => {
    document.body.classList.toggle('intro-active', showIntro);
    return () => document.body.classList.remove('intro-active');
  }, [showIntro]);

  useEffect(() => {
    if (photo !== null) modal.current?.showModal();
    else modal.current?.close();
  }, [photo]);

  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !motion) return;
      document.documentElement.style.setProperty('--cursor-x', `${event.clientX}px`);
      document.documentElement.style.setProperty('--cursor-y', `${event.clientY}px`);
    };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
    };
    window.addEventListener('pointermove', onPointer, {passive:true});
    window.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
    return () => {
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [motion]);

  useEffect(() => {
    if (showIntro || !('IntersectionObserver' in window)) return;
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    }), {threshold:.08});
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    const sectionObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) setActiveSection(visible.target.id);
    }, {rootMargin:'-22% 0px -58% 0px', threshold:[0, .2, .5, .8]});
    document.querySelectorAll('main section[id]').forEach(el => sectionObserver.observe(el));

    return () => {
      revealObserver.disconnect();
      sectionObserver.disconnect();
    };
  }, [showIntro]);

  // === V5 MOTION SYSTEM START ===
  useEffect(() => {
    if (showIntro || !motion || prefersReduced) return;

    const root = document.documentElement;

    const finePointer = window.matchMedia(
      '(hover: hover) and (pointer: fine)'
    ).matches;

    const clamp = (
      value:number,
      min:number,
      max:number
    ) => Math.min(max, Math.max(min, value));


    // ========================================================
    // CURSOR HUD
    // ========================================================

    const cursor = finePointer
      ? document.createElement('div')
      : null;

    const cursorText = finePointer
      ? document.createElement('span')
      : null;


    if (cursor && cursorText) {

      cursor.className = 'motion-cursor';

      cursor.setAttribute(
        'aria-hidden',
        'true'
      );

      cursor.appendChild(cursorText);

      document.body.appendChild(cursor);
    }


    const cursorMap:Array<[string,string]> = [

      ['.brand', 'HOME'],

      ['nav a', 'GO'],

      ['.nav-contact', 'HELLO'],

      [
        '.hero-actions .blue',
        'EXPLORE'
      ],

      [
        '.hero-actions .outline',
        'ABOUT'
      ],
[
        '.repo-link',
        'GITHUB'
      ],

      [
        '.photo-card button',
        'OPEN'
      ],

      [
        '.contact .button',
        'GITHUB'
      ],
    ];


    cursorMap.forEach(
      ([selector, label]) => {

        document
          .querySelectorAll<HTMLElement>(selector)
          .forEach(element => {

            element.dataset.motionCursor = label;

          });

      }
    );


    const cursorTargets = Array.from(
      document.querySelectorAll<HTMLElement>(
        '[data-motion-cursor]'
      )
    );


    const cursorListeners:Array<
      [
        HTMLElement,
        () => void,
        () => void
      ]
    > = [];


    cursorTargets.forEach(element => {

      const enter = () => {

        if (!cursor || !cursorText) return;

        cursorText.textContent =
          element.dataset.motionCursor ?? '';

        cursor.classList.add(
          'is-active'
        );
      };


      const leave = () => {

        cursor?.classList.remove(
          'is-active'
        );

      };


      element.addEventListener(
        'pointerenter',
        enter
      );


      element.addEventListener(
        'pointerleave',
        leave
      );


      cursorListeners.push([
        element,
        enter,
        leave
      ]);

    });


    // ========================================================
    // SCROLL-LINKED CINEMATIC SCENES
    // ========================================================

    const updateScenes = () => {

      const viewport =
        Math.max(
          window.innerHeight,
          1
        );


      root.dataset.scrolled =
        window.scrollY > 48
          ? 'true'
          : 'false';


      // ------------------------------------------------------
      // HERO
      // ------------------------------------------------------

      const hero =
        document.querySelector<HTMLElement>(
          '.hero'
        );


      if (hero) {

        const rect =
          hero.getBoundingClientRect();


        const progress = clamp(

          -rect.top /
          Math.max(
            rect.height * .72,
            1
          ),

          0,

          1
        );


        hero.style.setProperty(
          '--hero-copy-y',
          `${progress * -34}px`
        );


        hero.style.setProperty(
          '--hero-portrait-y',
          `${progress * 42}px`
        );


        hero.style.setProperty(
          '--hero-scene-y',
          `${progress * 62}px`
        );


        hero.style.setProperty(
          '--hero-scene-scale',
          `${1 + progress * .09}`
        );


        hero.style.setProperty(
          '--hero-opacity',
          `${1 - progress * .38}`
        );


        hero.style.setProperty(
          '--hero-grid-y',
          `${progress * 28}px`
        );

      }


      // ------------------------------------------------------
      // ALL SECTIONS
      // ------------------------------------------------------

      document
        .querySelectorAll<HTMLElement>(
          'main .section'
        )
        .forEach(section => {

          const rect =
            section.getBoundingClientRect();


          const center =
            rect.top +
            rect.height / 2;


          const focus = clamp(

            1 -
            Math.abs(
              center -
              viewport / 2
            ) /
            (
              viewport *
              .92
            ),

            0,

            1
          );


          const progress = clamp(

            (
              viewport -
              rect.top
            ) /
            Math.max(
              viewport +
              rect.height,
              1
            ),

            0,

            1
          );


          const shift =
            (1 - focus) * 18;


          section.style.setProperty(
            '--scene-y',
            `${shift}px`
          );


          section.style.setProperty(
            '--scene-opacity',
            `${.78 + focus * .22}`
          );


          section.style.setProperty(
            '--scene-scale',
            `${.988 + focus * .012}`
          );


          section.style.setProperty(
            '--scene-progress',
            progress.toFixed(4)
          );


          section.style.setProperty(
            '--image-shift',
            `${(progress - .5) * -22}px`
          );


          section.style.setProperty(
            '--grid-shift',
            `${progress * 42}px`
          );


          section.style.setProperty(
            '--grid-shift-y',
            `${progress * 19}px`
          );

        });

    };


    // ========================================================
    // REQUEST ANIMATION FRAME
    // ========================================================

    let frame = 0;


    const scheduleSceneUpdate = () => {

      if (frame) return;


      frame =
        window.requestAnimationFrame(
          () => {

            frame = 0;

            updateScenes();

          }
        );

    };


    // ========================================================
    // POINTER
    // ========================================================

    const onPointerMove = (
      event:PointerEvent
    ) => {

      if (!finePointer) return;


      cursor?.style.setProperty(
        '--motion-cursor-x',
        `${event.clientX}px`
      );


      cursor?.style.setProperty(
        '--motion-cursor-y',
        `${event.clientY}px`
      );


      root.style.setProperty(
        '--pointer-x-normalized',
        `${
          event.clientX /
          Math.max(
            window.innerWidth,
            1
          )
        }`
      );


      root.style.setProperty(
        '--pointer-y-normalized',
        `${
          event.clientY /
          Math.max(
            window.innerHeight,
            1
          )
        }`
      );

    };


    window.addEventListener(
      'pointermove',
      onPointerMove,
      {passive:true}
    );


    window.addEventListener(
      'scroll',
      scheduleSceneUpdate,
      {passive:true}
    );


    window.addEventListener(
      'resize',
      scheduleSceneUpdate,
      {passive:true}
    );


    updateScenes();


    // ========================================================
    // CLEANUP
    // ========================================================

    return () => {

      if (frame) {
        window.cancelAnimationFrame(frame);
      }


      window.removeEventListener(
        'pointermove',
        onPointerMove
      );


      window.removeEventListener(
        'scroll',
        scheduleSceneUpdate
      );


      window.removeEventListener(
        'resize',
        scheduleSceneUpdate
      );


      cursorListeners.forEach(
        ([element, enter, leave]) => {

          element.removeEventListener(
            'pointerenter',
            enter
          );


          element.removeEventListener(
            'pointerleave',
            leave
          );


          delete element.dataset.motionCursor;

        }
      );


      cursor?.remove();

      delete root.dataset.scrolled;

    };

  }, [
    motion,
    prefersReduced,
    showIntro
  ]);
  // === V5 MOTION SYSTEM END ===

  useEffect(() => {
    const handleKeys = (event: KeyboardEvent) => {
      if (photo === null) return;
      if (event.key === 'ArrowRight') setPhoto(current => current === null ? 0 : (current + 1) % photos.length);
      if (event.key === 'ArrowLeft') setPhoto(current => current === null ? 0 : (current + photos.length - 1) % photos.length);
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [photo]);

  const closeIntro = () => {
    if (introClosing) return;
    setIntroClosing(true);
    window.setTimeout(() => {
      setShowIntro(false);
      setIntroClosing(false);
      try { sessionStorage.setItem('folio-intro-seen', 'true'); } catch { /* Storage optional. */ }
    }, 900);
  };

  const replayIntro = () => {
    if (prefersReduced) return;
    window.scrollTo({top:0, behavior:'auto'});
    setMenu(false);
    setShowIntro(true);
    setIntroClosing(false);
  };

  const onHeroMove = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'mouse' || !motion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    heroPointer.current.x = ((event.clientX - rect.left) / rect.width - .5) * 2;
    heroPointer.current.y = -(((event.clientY - rect.top) / rect.height - .5) * 2);
  };
  const onHeroLeave = () => { heroPointer.current = {x:0, y:0}; };

  const transitionCaseStudy = (
    next:boolean
  ) => {

    const doc =
      document as Document & {
        startViewTransition?:
          (
            update:() => void
          ) => unknown;
      };


    const update = () =>
      setCaseStudy(next);


    if (
      motion &&
      !prefersReduced &&
      doc.startViewTransition
    ) {

      doc.startViewTransition(
        update
      );

    }
    else {

      update();

    }

  };


  const openCaseStudy = () =>
    transitionCaseStudy(true);


  const closeCaseStudy = () =>
    transitionCaseStudy(false);


  return <>
    {showIntro && <IntroOverlay motion={motion} closing={introClosing} onFinish={closeIntro} />}
    <div className={`site-shell ${showIntro ? 'site-shell--masked' : 'site-shell--ready'} ${caseStudy ? 'case-open' : ''}`}>
      <div className="scroll-progress" aria-hidden="true"><span style={{width:`${scrollProgress}%`}} /></div>
      <header>
        <a href="#home" className="brand" aria-label={`${profile.brand} home`}>{profile.brand.toLowerCase()}<span className="brand-jr" aria-hidden="true">{profile.initials}</span></a>
        <nav className={menu ? 'open' : ''} aria-label="Navigasi utama">
          {navItems.map(([id, title]) => <a key={id} className={activeSection === id ? 'active' : ''} href={`#${id}`} onClick={() => setMenu(false)}>{title}</a>)}
        </nav>
        <a className="nav-contact" href="#contact">Mari terhubung</a>
        <button className="menu-toggle" aria-label="Buka navigasi" aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X/> : <Menu/>}</button>
      </header>

      <main>
        <section id="home" className="hero" onPointerMove={onHeroMove} onPointerLeave={onHeroLeave}>
          <SceneSafety><HeroScene motion={motion} pointer={heroPointer} /></SceneSafety>

          <div className="hero-copy reveal visible">
            <p className="overline hero-kicker"><span className="status-dot"/> PERSONAL BRANDING · {profile.brand}</p>
            <h1>
              <span className="line line-1">Ruang digital untuk</span><br/>
              <span className="line line-2">cerita, proyek,</span><br/>
              <span className="line line-3 accent">dan proses belajar.</span>
            </h1>
            <p className="hero-desc">Mahasiswa Informatika yang membangun aplikasi, mempelajari hal baru, dan menemukan inspirasi di luar layar.</p>
            <div className="hero-actions">
              <Magnetic><a className="button blue" href="#work">Jelajahi proyek <ArrowDown size={16}/></a></Magnetic>
              <Magnetic><a className="button outline" href="#about">Kenalan dulu</a></Magnetic>
            </div>
            <div className="hero-meta"><span>{profile.educationShort}</span><span>{profile.location}</span></div>
          </div>

          <div className="portrait-stage reveal visible">
            <div className="portrait-orbit orbit-a" aria-hidden="true" />
            <div className="portrait-orbit orbit-b" aria-hidden="true" />
            <div className="portrait-outline" />
            <Tilt className="portrait-card">
              <img src={profile.portrait} alt={profile.portraitAlt} fetchPriority="high" decoding="async"/>
              <div className="portrait-caption"><span>THE PERSON BEHIND {profile.brand}</span><b>{profile.displayName}</b></div>
              <div className="floating-label label-code"><Code2 size={20}/><span>Building with purpose.</span></div>
              <div className="floating-label label-mountain"><Mountain size={20}/><span>Exploring beyond.</span></div>
            </Tilt>
            <span className="vertical-label">A PERSONAL COLLECTION OF WORK & LIFE</span>
          </div>
          <div className="hero-bottom reveal visible"><span>SCROLL TO DISCOVER</span><span className="scroll-cue"><span/> 01 — 05</span></div>
        </section>

        <div className="ticker" aria-label="Minat utama">
          <div className="ticker-track">
            {[0, 1].map(copy => <div className="ticker-group" key={copy} aria-hidden={copy === 1}>
              <span>WEB DEVELOPMENT</span><Plus/><span>COMPUTER VISION</span><Plus/><span>MOUNTAIN STORIES</span><Plus/><span>ALWAYS LEARNING</span><Plus/>
            </div>)}
          </div>
        </div>

        <section id="about" className="section about reveal">
          <div className="section-label">01 / THE PERSON</div>
          <div className="about-grid">
            <div>
              <h2>Di antara<br/><span>kode & perjalanan.</span></h2>
              <Tilt className="about-photo">
                <img src={profile.aboutImage} alt={profile.aboutAlt} loading="lazy" decoding="async"/>
                <span>A MOMENT OUTSIDE THE SCREEN</span>
                <div className="photo-depth-mark" aria-hidden="true">{profile.brand} / 01</div>
              </Tilt>
            </div>
            <div className="about-copy">
              <p className="large-copy">Halo, aku {profile.displayName}.<br/>Senang bertemu denganmu.</p>
              <p>{profile.bio}</p>
              <p>Lewat proyek dan praktikum, aku belajar menghubungkan ide, antarmuka, dan cara kerja sistem. Di luar itu, aku menikmati naik gunung dan bermain piano.</p>
              <dl>
                <div><dt>Pendidikan</dt><dd>{profile.education}</dd></div>
                <div><dt>Fokus saat ini</dt><dd>Pengembangan web & computer vision</dd></div>
                <div><dt>Identitas kreatif</dt><dd>{profile.brand}</dd></div>
              </dl>
              <div className="personal-tags"><span><Code2 size={16}/> Developer in progress</span><span><Mountain size={16}/> Outdoor enthusiast</span><span><Keyboard size={16}/> Piano player</span></div>
            </div>
          </div>
        </section>

        <section id="work" className="section work reveal">
          <div className="section-label">02 / SELECTED WORK</div>
          <div className="section-heading"><h2>Belajar. Membangun.<br/><span>Menyempurnakan.</span></h2><p>Contoh fiktif untuk menunjukkan format portofolio. Ganti dengan proyek dan pengalamanmu sendiri.</p></div>
          <article className="featured-project">
            <Tilt className="project-art">
              <div className="project-art-grid" aria-hidden="true" />
              <div className="project-art-header"><span>{profile.brand} / CASE STUDY 01</span><Monitor size={22}/></div>
              <div className="coffee-wordmark">DEMO<br/><span>COFFEE.</span></div>
              <div className="project-art-footer"><span>POINT OF SALE<br/>& MANAGEMENT SYSTEM</span><span>WEB APP</span></div>
            </Tilt>
            <div className="project-copy">
              <p className="overline">CONTOH FIKTIF / WEB APPLICATION</p>
              <h3>Operasional kedai dalam satu aplikasi.</h3>
              <p>Demo Coffee menyatukan transaksi kasir, pengelolaan stok, dan ringkasan penjualan dalam satu alur kerja untuk owner, admin, dan kasir.</p>
              <div className="tags">{['Laravel', 'PHP', 'MySQL', 'Tailwind CSS'].map(x => <span key={x}>{x}</span>)}</div>
              <button className="detail-button" aria-expanded={detail} aria-controls="project-detail" onClick={() => setDetail(!detail)}>Cerita di balik proyek {detail ? <Minus size={18}/> : <Plus size={18}/>}</button>
              <div id="project-detail" className={`project-detail ${detail ? 'open' : ''}`} aria-hidden={!detail}>
                <div><p>Contoh kontribusi yang dapat dijelaskan mencakup pengembangan bersama tim, integrasi pembayaran Midtrans sandbox, pengujian alur stok dan transaksi, serta penyempurnaan antarmuka kasir.</p><p>Pengujian mencakup reservasi stok, perubahan status pembayaran, dan transaksi bersamaan sebagai contoh skenario pengujian.</p></div>
              </div>
              <Magnetic>
                <button
                  type="button"
                  className="case-study-button"
                  onClick={openCaseStudy}
                >
                  <Monitor size={18}/>
                  Buka full case study
                  <ExternalLink size={15}/>
                </button>
              </Magnetic>
              <Magnetic>{repository && (<a className="repo-link" href={repository} target="_blank" rel="noreferrer"><Github size={19}/> Lihat repository <ExternalLink size={15}/></a>)}</Magnetic>
            </div>
          </article>
          <Tilt className="exploration">
            <div><Layers size={25}/><span>LEARNING LOG</span></div><h3>Computer vision & CNN</h3><p>Eksplorasi Python, pengolahan citra, dan CNN melalui praktikum serta eksperimen mandiri.</p><span className="learning-badge">Dalam eksplorasi</span>
          </Tilt>
        </section>

        <section className="section skills reveal">
          <div className="section-label">03 / MY TOOLKIT</div>
          <div className="section-heading"><h2>Alat untuk<br/><span>mewujudkan ide.</span></h2><p>Teknologi yang kupakai untuk membangun aplikasi, mengelola data, dan bereksperimen.</p></div>
          <div className="skills-grid">{[
            {icon:Code2, no:'01', title:'Web development', list:['PHP / Laravel', 'JavaScript / Alpine.js', 'Tailwind CSS'], desc:'Membangun aplikasi dan antarmuka yang mendukung alur kerja pengguna.'},
            {icon:Layers, no:'02', title:'Data & collaboration', list:['MySQL', 'Git / GitHub', 'PHPUnit'], desc:'Mengelola data, menguji perilaku sistem, dan bekerja bersama tim.'},
            {icon:Camera, no:'03', title:'Visual computing', list:['Python', 'Pengolahan citra', 'CNN · sedang dipelajari'], desc:'Mengenali pola dan memahami bagaimana komputer mengolah citra.'},
          ].map(s => <Tilt className="skill-card" key={s.no}><div className="skill-top"><s.icon/><span>{s.no}</span></div><h3>{s.title}</h3><p>{s.desc}</p><ul>{s.list.map(l => <li key={l}>{l}</li>)}</ul><div className="skill-corner" aria-hidden="true"/></Tilt>)}</div>
        </section>

        <section id="journey" className="section journey reveal">
          <div className="section-label">04 / BEYOND THE SCREEN</div>
          <div className="section-heading"><h2>Sedikit lebih jauh.<br/><span>Sedikit lebih luas.</span></h2><p>Potongan perjalanan di alam. Tempat untuk berhenti sejenak dan menikmati perspektif yang berbeda.</p></div>
          <div className="gallery">{photos.map((p, i) => <Tilt className={`photo-card photo-${i}`} key={p.src}><button onClick={() => setPhoto(i)} aria-label={`Lihat foto: ${p.title}`}><img src={`/photos/${p.src}`} alt={p.caption} loading="lazy" decoding="async"/><div className="photo-shade"/><div className="photo-text"><span>0{i + 1} / FIELD NOTES</span><h3>{p.title}</h3></div><span className="photo-plus"><Plus size={22}/></span></button></Tilt>)}</div>
        </section>

        <section id="contact" className="section contact reveal">
          <div className="contact-orbit orbit-one" aria-hidden="true"/><div className="contact-orbit orbit-two" aria-hidden="true"/>
          <div className="section-label">05 / WHAT'S NEXT?</div>
          <p><Sparkles size={15}/> IDE BARU SELALU PUNYA TEMPAT.</p>
          <h2>Let's build<br/><span>something meaningful.</span></h2>
          <Magnetic>{repository && (<a className="button blue" href={repository} target="_blank" rel="noreferrer"><Github size={18}/> Temukan proyekku di GitHub</a>)}</Magnetic>
          {!repository && <a className="button outline" href="#work">Lihat proyek contoh</a>}
          <div className="contact-line"><span>{profile.fullName}</span><span>{profile.location}</span></div>
        </section>
      </main>

      <footer>
        <a className="brand" href="#home">{profile.brand.toLowerCase()}<span className="brand-jr" aria-hidden="true">{profile.initials}</span></a>
        <span>Code, curiosity, and a little fresh air.</span>
        <button aria-pressed={motion} onClick={() => setMotion(!motion)}>Efek gerak: {motion ? 'aktif' : 'nonaktif'}</button>
        {!prefersReduced && <button onClick={replayIntro}>Putar intro lagi</button>}
        <a href="#home">Kembali ke atas</a>
      </footer>

      <DemoCaseStudy
        open={caseStudy}
        onClose={closeCaseStudy}
      />
      <dialog ref={modal} className="lightbox" onCancel={() => setPhoto(null)} onClick={event => {if (event.target === modal.current) setPhoto(null);}} aria-label="Foto perjalanan">
        <button className="close" autoFocus aria-label="Tutup foto" onClick={() => setPhoto(null)}><X/></button>
        {photo !== null && <><img src={`/photos/${photos[photo].src}`} alt={photos[photo].caption}/><div className="lightbox-bottom"><button aria-label="Foto sebelumnya" onClick={() => setPhoto((photo + photos.length - 1) % photos.length)}>Sebelumnya</button><p><strong>{photos[photo].title}</strong><br/>{photos[photo].caption}</p><button aria-label="Foto berikutnya" onClick={() => setPhoto((photo + 1) % photos.length)}>Berikutnya</button></div></>}
      </dialog>
    </div>
  </>;
}

try {
  createRoot(document.getElementById('root')!).render(<App/>);
} catch (error) {
  document.getElementById('root')!.textContent = 'Portofolio gagal dimuat. Buka melalui Chrome atau Edge dan kirim pesan Console. ' + String(error);
}


