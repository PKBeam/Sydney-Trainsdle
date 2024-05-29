import './App.css';

import React, {useState} from "react";

import 'bootstrap/dist/css/bootstrap.min.css';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Table from 'react-bootstrap/Table';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';

import GuessRow from './GuessRow.js'
import trainData from './data.json';

function App() {

  const [value, setValue] = useState({
    "seed": null,
    "guesses": [],
    "target": getMysteryStation(),
    "enabled": true,
    "forfeit": false
  });

  function guess(e) {
    if (e.key !== 'Enter') {
      return
    }

    let query = e.target.value

    let guess = null
    for (var i = 0; i < trainData.length; i++) {
        let thisStation = trainData[i]["name"]
        if (query.toUpperCase() === thisStation.toUpperCase()) {
            guess = trainData[i]
        }
    }

    if (guess === null) {
      return
    }
    if (value.guesses.map(i => i.name).includes(guess.name)) {
      return 
    }

    e.target.value = ""

    setValue({
      "seed": value.seed,
      "guesses": value.guesses.concat(guess),
      "target": value.target,
      "enabled": guess.name !== value.target.name,
      "forfeit": value.forfeit
    })
  }

  function getMode() {
    let mode = new URLSearchParams(window.location.search).get("mode")
    return mode
  }

  function forfeit() {
    setValue({
      "seed": value.seed,
      "guesses": value.guesses.concat(value.target),
      "target": value.target,
      "enabled": false,
      "forfeit": true
    })
  }

  function getMysteryStation(seed) {
    let mode = getMode()
    if (mode === "infinite") {
      seed = Date.now()
    } else {
      /* Unique seed per day */
      seed = Math.round(Date.now() / (1000 * 60 * 60 * 24))
    }

    // https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
    function splitmix32(a) {
      return function() {
        a |= 0;
        a = a + 0x9e3779b9 | 0;
        let t = a ^ a >>> 16;
        t = Math.imul(t, 0x21f0aaad);
        t = t ^ t >>> 15;
        t = Math.imul(t, 0x735a2d97);
        return ((t = t ^ t >>> 15) >>> 0);
      }
    }
    const prng = splitmix32(seed)
    let numKeys = trainData.length
    let station = trainData[prng() % numKeys]

    return station
  }

  return (
    <div className="App">
      <Navbar expand="lg" bg="dark" data-bs-theme="dark">
      
        <Container>
          <Navbar.Brand>
            <img
              src="sydneytrains.png"
              width="30"
              height="30"
              className="d-inline-block align-top"
              style={{"marginRight": "10px"}}
              alt="Sydney Trains logo"
            />
              Sydney Trainsdle
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="?mode=daily">Daily</Nav.Link>
            <Nav.Link href="?mode=infinite">Infinite</Nav.Link>
          </Nav>
        </Navbar.Collapse>
        </Container>
      </Navbar>
      <header className="App-header">
        {value.guesses.length === 0 ? <h1>{(getMode() == "infinite" ? "Infinite" : "Daily") + " Traindle"}</h1>: <div/>}
        {value.enabled ? <Form className="mb-5" onSubmit={e => { e.preventDefault(); }}>
          <Form.Group>
            <Form.Label>Search for a train or metro station...</Form.Label>
            <Form.Control type="text" placeholder="e.g. Town Hall" onKeyDown={guess}/>
          </Form.Group>
        </Form> : <h1 className="my-5">
          {value.forfeit ? `The station was ${value.target.name}!` :
            `You got it in ${value.guesses.length} ` + (value.guesses.length === 1 ? "guess!" : "guesses!")}
        </h1>}

        {value.guesses.length === 0 ? <div/> : <div style={{width: "70%"}}><Table variant="dark" striped bordered style={{verticalAlign: "middle"}}>
          <thead>
            <tr>
              <th></th>
              <th>Station Name</th>
              <th>Lines</th>
              <th>Distance from Central</th>
              <th>Daily Usage</th>
            </tr>
          </thead>
          <tbody>
            {value.guesses.slice().reverse().map((g, i) =>
                (<GuessRow key={i} guess={g} correct={value.target}/>)
            )}
          </tbody>
        </Table>
        {value.enabled ? <Button className="my-3 btn-danger" onClick={forfeit}>Give up?</Button> : <div/>}</div>}
      </header>
    </div>
  );
}

export default App;
