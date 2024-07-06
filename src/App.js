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
      /* Unique seed per day (UTC+10 = sydney time) */
      seed = Math.floor((Date.now() / (1000 * 60 * 60 * 24)) + 10/24)
    }

    // https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
    function splitmix32(a) {
      return function() {
        a |= 0;
        a = a + 0x9e3779b9 | 0;
        let t = a ^ (a >>> 16);
        t = Math.imul(t, 0x21f0aaad);
        t = t ^ (t >>> 15);
        t = Math.imul(t, 0x735a2d97);
        return ((t = t ^ (t >>> 15)) >>> 0);
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
	  <Navbar.Brand>
	    <a href="https://github.com/PKBeam/Sydney-Trainsdle">
	      <svg height="32" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="32" data-view-component="true" class="octicon octicon-mark-github">
    	        <path fill="#FFFFFF" d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
	      </svg>
	    </a>
	  </Navbar.Brand>
        </Navbar.Collapse>
        </Container>
      </Navbar>
      <header className="App-header">
        {value.guesses.length === 0 ? <h1>{(getMode() === "infinite" ? "Infinite" : "Daily") + " Traindle"}</h1>: <div/>}
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
            <tr style={{verticalAlign: "middle"}}>
              <th></th>
              <th>Name</th>
              <th>Lines</th>
              <th>Platforms</th>
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
