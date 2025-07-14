export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  res.json({ status: 'OK', message: 'VoterImpact API is running' });
}