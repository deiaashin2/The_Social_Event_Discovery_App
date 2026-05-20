const axios = require("axios");

const mapTicketmasterEvent = (event) => ({
  event_id: event.id,
  title: event.name,
  description: event.info || event.pleaseNote || null,
  start_time:
    event.dates?.start?.dateTime || event.dates?.start?.localDate || null,
  end_time: null,
  location_name: event._embedded?.venues?.[0]?.name || null,
  image: event.images?.[0]?.url || null,
  ticketmaster_url: event.url || null,
  category: event.classifications?.[0]?.segment?.name || "General",
  host_name: event.promoter?.name || "Ticketmaster",
  rsvp_count: 0,
  source: "ticketmaster",
});

exports.getTicketmasterEvents = async (req, res) => {
  try {
    const {
      keyword,
      city,
      countryCode = "US",
      size = 20,
      classificationName,
      sort,
      source = "ticketmaster",
      dmaId,
      latlong,
      radius = 100,
      unit = "miles",
    } = req.query;

    if (!process.env.TICKETMASTER_API_KEY) {
      return res.status(500).json({
        error: "Ticketmaster API key is missing",
      });
    }

    // Ticketmaster does NOT support "popularity,desc".
    // Search = relevance, homepage/default = soonest upcoming events.
    const sortValue = sort || (keyword ? "relevance,desc" : "date,asc");

    const response = await axios.get(
      "https://app.ticketmaster.com/discovery/v2/events.json",
      {
        params: {
          apikey: process.env.TICKETMASTER_API_KEY,

          // Only upcoming events
          startDateTime: new Date().toISOString().split(".")[0] + "Z",

          sort: sortValue,
          size,
          countryCode,

          ...(keyword ? { keyword } : {}),
          ...(city ? { city } : {}),
          ...(classificationName ? { classificationName } : {}),
          ...(source ? { source } : {}),
          ...(dmaId ? { dmaId } : {}),
          ...(latlong ? { latlong } : {}),
          ...(radius ? { radius } : {}),
          ...(unit ? { unit } : {}),
        },
      }
    );

    const rawEvents = response.data._embedded?.events || [];
    const events = rawEvents.map(mapTicketmasterEvent);

    res.json(events);
  } catch (err) {
    console.error("Ticketmaster error:", err.response?.data || err.message);

    const status = err.response?.status ?? 500;

    res.status(status).json({
      error: "Failed to fetch Ticketmaster events",
    });
  }
};

exports.getTicketmasterEventById = async (req, res) => {
  try {
    if (!process.env.TICKETMASTER_API_KEY) {
      return res.status(500).json({
        error: "Ticketmaster API key is missing",
      });
    }

    const response = await axios.get(
      `https://app.ticketmaster.com/discovery/v2/events/${req.params.id}.json`,
      {
        params: {
          apikey: process.env.TICKETMASTER_API_KEY,
        },
      }
    );

    const event = response.data;

    res.json(mapTicketmasterEvent(event));
  } catch (err) {
    console.error(
      "Ticketmaster detail error:",
      err.response?.data || err.message
    );

    const status = err.response?.status ?? 500;

    res.status(status).json({
      error: "Failed to fetch Ticketmaster event details",
    });
  }
};