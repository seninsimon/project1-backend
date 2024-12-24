const pincodeLookup = async (req, res) => {
    const { pincode } = req.params;

    try {
        const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
        if (response.data[0].Status === 'Success') {
            const { District, State } = response.data[0].PostOffice[0];
            res.status(200).json({ city: District, state: State });
        } else {
            res.status(404).json({ message: 'Invalid pincode' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pincode data', error });
    }
};

router.get('/pincode/:pincode', pincodeLookup);
