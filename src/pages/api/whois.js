import whois from 'whois';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    whois.lookup(url, (err, data) => {
      if (err) {
        throw err;
      }

      const parsedData = processWhoisData(data);

      res.status(200).json({
        url,
        whoisData: parsedData,
        message: 'Whois data retrieved successfully',
      });
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch whois data',
      details: error.message,
    });
  }
}

function processWhoisData(data) {
  const importantData = {};

  const domainNameMatch = data.match(/Domain Name:\s*(\S+)/);
  if (domainNameMatch) importantData.domainName = domainNameMatch[1];

  const domainIdMatch = data.match(/Registry Domain ID:\s*(\S+)/);
  if (domainIdMatch) importantData.domainId = domainIdMatch[1];

  const registrarMatch = data.match(/Registrar:\s*(.+)/);
  if (registrarMatch) importantData.registrar = registrarMatch[1];

  const whoisServerMatch = data.match(/Registrar WHOIS Server:\s*(\S+)/);
  if (whoisServerMatch) importantData.whoisServer = whoisServerMatch[1];

  const creationDateMatch = data.match(/Creation Date:\s*(\S+\s\S+)/);
  if (creationDateMatch) importantData.creationDate = creationDateMatch[1];

  const expirationDateMatch = data.match(/Registrar Registration Expiration Date:\s*(\S+\s\S+)/);
  if (expirationDateMatch) importantData.expirationDate = expirationDateMatch[1];

  const nameServersMatch = data.match(/Name Server:\s*(\S+)/g);
  if (nameServersMatch) importantData.nameServers = nameServersMatch.map(server => server.split(': ')[1]);

  const registrantOrgMatch = data.match(/Registrant Organization:\s*(.+)/);
  if (registrantOrgMatch) importantData.registrantOrganization = registrantOrgMatch[1];

  const registrantEmailMatch = data.match(/Registrant Email:\s*(\S+)/);
  if (registrantEmailMatch) importantData.registrantEmail = registrantEmailMatch[1];

  return importantData;
}
