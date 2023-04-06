import React, { useState, useEffect } from "react";
import axios from "axios";
import codes from "./ressources/codeList.json"
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table'


function App() {
  //Get the code list in JSON
  const codeOptions = Object.entries(codes);

  //Define data for the form
  const [formState, setFormState] = useState({
    sexe: "",
    ethnicity: "",
    age: "",
    entryDate: "",
    exitDate: "",
    service: "",
    allergies: "",
    checkedBoxes: [[],[]],
    code: ""
  });

  //State for the modal
  const [selectedWords, setSelectedWords] = useState([]);

  //State for the submition of the form
  const [dataState, setDataState] = useState({text: ""});

  //State for the modal
  const [modalShow, setModalShow] = React.useState(false);

  //State for the loading
  const [isLoading, setIsLoading] = useState(false);

  //State for the loading
  const [colorMode, setColorMode] = useState(false);

  const [dataUpdater, setDataUpdater] = useState({text: ""});

  const [haveReciveResponse, setHaveReciveResponse] = useState(false);
  

  //Show the modal and cancel or add datas from the code list if there are one selected.
  const handleModalSubmit = (event) => {
    event.preventDefault();
    const selectedCodeLabel = document.getElementById("code").selectedOptions[0].label;
    const selectedCheckBoxes = Array.from(document.querySelectorAll("input[type='checkbox']:checked")).map((box) => box.value);
    
    // Check if the same code is already selected
    const existingCodeIndex = formState.checkedBoxes[0].indexOf(selectedCodeLabel);
  
    if (existingCodeIndex !== -1) {
      // Update the existing code with the new checkboxes
      const newCheckedBoxes = [...formState.checkedBoxes];
      newCheckedBoxes[1][existingCodeIndex] = selectedCheckBoxes;
      setFormState(prevState => ({...prevState, checkedBoxes: newCheckedBoxes}));
    } else {
      // Add a new code with the selected checkboxes
      const newCheckedBoxes = [[...formState.checkedBoxes[0], selectedCodeLabel], [...formState.checkedBoxes[1], selectedCheckBoxes]];
      setFormState(prevState => ({...prevState, checkedBoxes: newCheckedBoxes}));
    }
  
    setModalShow(false);
  };

  useEffect(() => {
    if (formState.code) {
      const selectedCode = codes[formState.code];
      const existingCodeIndex = formState.checkedBoxes[0].indexOf(selectedCode.label);
  
      if (existingCodeIndex !== -1) {
        setSelectedWords(selectedCode.words);
        document.querySelectorAll("input[type='checkbox']").forEach((box, index) => {
          box.checked = formState.checkedBoxes[1][existingCodeIndex].indexOf(box.value) !== -1;
        });
      } else {
        setSelectedWords(selectedCode.words);
        document.querySelectorAll("input[type='checkbox']").forEach((box) => {
          box.checked = false;
        });
      }
    }
  }, [formState.code]);
  


  //Change dynamicly datas on the form
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  //Submit the form to the back, wait for a response of chatGPT and then set the data in a state.
  const handleSubmit = (event) => {
    event.preventDefault();
    setIsLoading(true); // active l'animation
    axios.post("http://127.0.0.1:5000/api/form", formState)
      .then((response) => {
        setDataState({ text: response.data });
        setIsLoading(false); // désactive l'animation
        setHaveReciveResponse(true)
      })
      .catch((error) => {
        console.log(error);
        setDataState({ text: "An error occure, please check you internet connection. For more info, check the console log" });
        setIsLoading(false); // désactive l'animation
    });
  };

  const handleDeleteRow = (indexToDelete) => {
    const newCheckedBoxes = [
      formState.checkedBoxes[0].filter((_, index) => index !== indexToDelete),
      formState.checkedBoxes[1].filter((_, index) => index !== indexToDelete),
    ];
    setFormState((prevState) => ({
      ...prevState,
      checkedBoxes: newCheckedBoxes,
    }));
  };

  const handleUpdaterSubmit = (event) => {
    event.preventDefault();
    setIsLoading(true);
    axios.post("http://127.0.0.1:5000/api/updater", [dataUpdater, dataState])
      .then((response) => {
        setDataState({ text: response.data });
        setIsLoading(false); // désactive l'animation
        setHaveReciveResponse(true);
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false); // désactive l'animation
        setHaveReciveResponse(true);
      });
  };

  const handleUpdaterChange = (event) => {
    const { name, value } = event.target;
    setDataUpdater((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };


  return (
    <>
    <div className="App">
      <h1>Discharge summary</h1>
      <Container className="p-1">
        <Row>
          <Col className="ms-auto" xs={12} md={6}>
            <Form onSubmit={handleSubmit}>
              <Row className="mb-2">
                <Col>
                  <Form.Label className="form-label" variant="white" htmlFor="sexe">Sex :</Form.Label>
                  <Form.Select className="form-input-select" id="sexe" name="sexe" value={formState.sexe} onChange={handleInputChange} required>
                    <option defaultValue="unknow">Unknow</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </Form.Select>
                </Col>
                <Col>
                  <Form.Label className="form-label" htmlFor="age">Age:</Form.Label>
                  <Form.Control className="form-input" type="number" id="age" name="age" value={formState.age} onChange={handleInputChange} onKeyDown={(evt) => ["e", "E", "+", "-"].includes(evt.key) && evt.preventDefault()} required />
                </Col>
                <Col>
                  <Form.Label className="form-label" htmlFor="ethnicity">Ethnicity:</Form.Label>
                  <Form.Control className="form-input" type="text" id="ethnicity" name="ethnicity" value={formState.ethnicity} onChange={handleInputChange} required />
                </Col>
              </Row>
              <Row className="mb-2">
                <Col>
                  <Form.Label className="form-label" htmlFor="entryDate">Entry date:</Form.Label>
                  <Form.Control className="form-input" type="date" id="entryDate" name="entryDate" value={formState.entryDate} onChange={handleInputChange} required />
                </Col>
                <Col>
                  <Form.Label className="form-label" htmlFor="exitDate">Discharge date:</Form.Label>
                  <Form.Control className="form-input" type="date" id="exitDate" name="exitDate" value={formState.exitDate} onChange={handleInputChange} required />
                </Col>
              </Row>
              <Row className="mb-2 row-wrap">
                <Col>
                  <Form.Label className="form-label" htmlFor="service">Service:</Form.Label>
                  <Form.Control className="form-input" type="text" id="service" name="service" value={formState.service} onChange={handleInputChange} required />
                </Col>
              </Row>
              <Row className="mb-2 row-wrap">
                <Col>
                  <Form.Label className="form-label" htmlFor="allergies">Allergies:</Form.Label>
                  <Form.Control as="textarea" rows={3} id="allergies" name="allergies" value={formState.allergies} onChange={handleInputChange}></Form.Control>
                </Col>
              </Row>
              <Row className="mb-2 row-wrap">
                <Col>
                  <Row>
                    <Col>
                      <Form.Label className="form-label" htmlFor="code">Code:</Form.Label>
                    </Col>
                  </Row>
                  {formState.checkedBoxes && formState.checkedBoxes[0].length > 0 &&
                    <Row>
                      <Col>
                        <div className="table-container mb-3">
                          <Table striped bordered hover variant="dark">
                            <thead>
                              <tr>
                                <th>Diseases</th>
                                <th>selected words</th>
                              </tr>
                            </thead>
                            <tbody>
                            {formState.checkedBoxes[0].map((disease, index) => (
                              <tr key={index}>
                                <td>{disease}</td>
                                <td>{formState.checkedBoxes[1].filter((words, i) => i === index)[0].join(", ")}</td>
                                <td className="tdMenu d-block m-2"><Button variant="danger" onClick={() => handleDeleteRow(index)}>D</Button></td>
                              </tr>
                            ))}
                            </tbody>
                          </Table>
                        </div>
                      </Col>
                    </Row>
                  }
                  <Row>
                    <Col>
                      <Button variant="primary" onClick={() => setModalShow(true)}>
                        Add a new code
                      </Button>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row className="mb-3 text-center">
                <Col>
                  <Button as="input" type="submit" variant="success" className="" value="Send" disabled={isLoading}/>
                </Col>
              </Row>
            </Form>
            {haveReciveResponse ? (
              <Form onSubmit={handleUpdaterSubmit}>
                <Row className="mb-3">
                  <Col>
                      <Form.Label className="form-label" htmlFor="updater">Tell to chatGPT what add, update or delete:</Form.Label>
                      <Form.Control as="textarea" rows={3} id="updater" name="text" value={dataUpdater.text} onChange={handleUpdaterChange} ></Form.Control>
                  </Col>
                </Row>
                <Row className="text-center mt-2">
                  <Col>
                    <Button type="submit" variant="success" value="Update Discharge summary" disabled={isLoading}>Update Discharge summary</Button>
                  </Col>
                </Row>
              </Form>
            ):(
              ""
            )}
          </Col>
          <Col className="mr-auto" xs={12} md={6}>
            {isLoading ? (
              <div>
                <div className="lds-dual-ring"></div>
                <span>Loading times can vary following your internet connection or chatGPT demands</span>
              </div>
            ) : (
              <textarea className="textareaOutputGPT" name="" id="GPToutput" cols="30" value={dataState.text} readOnly></textarea>
            )}
          </Col>
        </Row>
      </Container>

      <MyVerticallyCenteredModal
        show={modalShow}
        onHide={() => setModalShow(false)}
      />
      
    </div>
    </>
  );
  
  //Function for the modal. Should have props for add precedent data and save new datas in a state
  function MyVerticallyCenteredModal(props) {
    const isChecked = (word) => {
      const codeElement = document.getElementById("code");
    
      if (codeElement) {
        const selectedCodeLabel = codeElement.selectedOptions[0].label;
        const existingCodeIndex = formState.checkedBoxes[0].indexOf(selectedCodeLabel);
    
        if (existingCodeIndex !== -1) {
          return formState.checkedBoxes[1][existingCodeIndex].indexOf(word.join(", ")) !== -1;
        }
      }
    
      return false;
    };
    
    

    return (
      <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Modal heading
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Label className="form-label" htmlFor="code">Code :</Form.Label>
          <Form.Select className="form-input-select mb-2" id="code" name="code" value={formState.code} onChange={handleInputChange}>
            {codeOptions.map(([key, value]) => (
              <option key={key} value={key} label={value.label}>{key} - {value.label}</option>
            ))}
          </Form.Select>
          <ul>
            {selectedWords.map((words, index) => (
              <li className="checkbox-label-container" key={index}>
                <Form.Check label={words.join(", ")} htmlFor={`word-${index}`} type="checkbox" id={`word-${index}`} name={`word-${index}`} value={[words]} defaultChecked={isChecked(words)} />
              </li>
            ))}
          </ul>
      </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={props.onHide}>
            Annuler
          </Button>
          <Button variant="success" onClick={handleModalSubmit}>
            Ajouter
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }  
}

export default App;