export default function TestPage() {
    return (
        <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
            <h1>Connectivity Test</h1>
            <p>If you see this, the project is deploying correctly to Vercel.</p>
            <p>Time: {new Date().toISOString()}</p>
        </div>
    );
}
