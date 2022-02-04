const About = () => {
    return (
        <>
            <h2>About</h2>
            <h4>Build Date/Time: {process.env.REACT_APP_BUILD_DATE_TIME}</h4>
        </>
    );
};

export default About;