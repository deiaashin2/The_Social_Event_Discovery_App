const getUserPreferences = async (userId) => {
  // TEMP mock (replace later with DB)
  return {
    rsvp: true,
    mention: true,
    reminder: true,
  };
};

const shouldNotify = async (userId, type) => {
  const prefs = await getUserPreferences(userId);

  switch (type) {
    case "RSVP":
      return prefs.rsvp;

    case "MENTION":
      return prefs.mention;

    case "EVENT_REMINDER":
      return prefs.reminder;

    default:
      return false;
  }
};

module.exports = { shouldNotify };