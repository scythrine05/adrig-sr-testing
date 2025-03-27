module.exports = {
    env: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || `https://${process.env.VERCEL_URL}`,
    },
  };