const D2B1Data = {
  system: {
    openedByAdmin: true,
    admin: {
      email: "admin@d2b1.com",
      otpRequired: true,
      reportsFromSupervisors: [],
      personalInfoRecords: []
    },
    requests: {
      reconnection: [],
      reset: [],
      disconnect: []
    },
    historicalLog: []
  },
  supervisors: [
    {
      id: "sup001",
      name: "SP Jean Michel",
      email: "sp.jeanmichel@example.com",
      phone: "+50912345678",
      nif: "012-345-678-9",
      reports: [],
      teamLeaders: [
        {
          id: "tl001",
          name: "TL Marie Claude",
          email: "tl.marieclaude@example.com",
          phone: "+50998765432",
          passport: "#P1234567",
          participants: [
            {
              name: "Participant 1",
              invested: 10,
              gained: 70,
              date: "2025-06-28T06:46:25"
            }
          ]
        }
      ]
    }
  ]
};
