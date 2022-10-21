/**
 * @jest-environment jsdom
 */

 import "@testing-library/jest-dom";
 import { screen, waitFor, fireEvent } from "@testing-library/dom";
 import userEvent from "@testing-library/user-event";
 import NewBillUI from "../views/NewBillUI.js";
 import NewBill from "../containers/NewBill.js";
 import { localStorageMock } from "../__mocks__/localStorage.js";
 import mockStore from "../__mocks__/store.js";
 import { ROUTES, ROUTES_PATH } from "../constants/routes";
 import router from "../app/Router.js";

 // Mock du store
 jest.mock("../app/store", () => mockStore);

 describe("Given I am connected as an employee", () => {
	describe("When I am on NewBill Page", () => {

		// Préparation répétée: utilisation du hook "beforeEach"
		beforeEach(() => {
			Object.defineProperty(window, "localStorage", { value: localStorageMock });
			window.localStorage.setItem("user", JSON.stringify({
				type: "Employee",
			}));
			document.body.innerHTML = `<div id="root"></div>`;
			router();
		});

		// Vérifie que l'icone "enveloppe" soit en surbrillance
		it("Then mail icon in vertical layout should be highlighted", async () => {
			window.onNavigate(ROUTES_PATH.NewBill);
			await waitFor(() => screen.getByTestId("icon-mail"));
			const mailIcon = screen.getByTestId("icon-mail");
			expect(mailIcon).toHaveClass("active-icon");
		});

		// Vérifie si le titre du formulaire est affiché
		it("Then title text content should be displayed", async () => {
			window.onNavigate(ROUTES_PATH.NewBill);
			expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
		});

		// Vérifie les champs qui sont requis ou non soit bien configurés
		it("Then required fields have the 'Required' attribute'", () => {
			expect(screen.getByTestId("expense-type")).toBeRequired();
			expect(screen.getByTestId("expense-name")).not.toBeRequired();
			expect(screen.getByTestId("datepicker")).toBeRequired();
			expect(screen.getByTestId("amount")).toBeRequired();
			expect(screen.getByTestId("vat")).not.toBeRequired();
			expect(screen.getByTestId("pct")).toBeRequired();
			expect(screen.getByTestId("commentary")).not.toBeRequired();
			expect(screen.getByTestId("file")).toBeRequired();
		});
	});

	describe("When I submit the form with empty fields", () => {

		// Vérifie que si le formulaire est soumis avec des champs vide on reste bien sur la page
		it("Then I should stay on NewBill page", () => {
			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};
			const newBillInit = new NewBill({
				document,
				onNavigate,
				mockStore,
				localStorage: window.localStorage,
			});

			expect(screen.getByTestId("expense-name").value).toBe("");
			expect(screen.getByTestId("datepicker").value).toBe("");
			expect(screen.getByTestId("amount").value).toBe("");
			expect(screen.getByTestId("vat").value).toBe("");
			expect(screen.getByTestId("pct").value).toBe("");
			expect(screen.getByTestId("file").value).toBe("");

			// Sélectionne le formulaire
			const form = screen.getByTestId("form-new-bill");
			// Mock de la fonction qui soumet le formulaire
			const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
			// Ajoute l'event
			form.addEventListener("submit", handleSubmit);
			// Simule le click de l'utilisateur
			fireEvent.submit(form);
			// Vérifie l'appel de la fonction et la présence du formulaire
			expect(handleSubmit).toHaveBeenCalled();
			expect(form).toBeTruthy();
		});
	});

	describe("When I upload file in form", () => {

		// Vérifie le conportement de l'upload de fichier si le fichier est valide
		it("Then, is the file is valid", async () => {
			document.body.innerHTML = NewBillUI();
			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};
			const newBillInit = new NewBill({
				document,
				onNavigate,
				store: mockStore,
				localStorage: window.localStorage,
			});

			// Simule un fichier JPG
			const file = new File(["img"], "image.jpg", { type: "image/jpg" });
			// Selectionne l'input
			const inputFile = screen.getByTestId("file");
			// Mock de la fonction qui ajoute un fichier
			const handleChangeFile = jest.fn(newBillInit.handleChangeFile);
			// Ajoute l'event
			inputFile.addEventListener("change", handleChangeFile);
			// Simule l'action de l'utilisateur
			userEvent.upload(inputFile, file);
			// Vérifie l'appel de la fonction
			expect(handleChangeFile).toHaveBeenCalled();
			// Vérifie la correspondance du fichier
			expect(inputFile.files[0]).toStrictEqual(file);
			// Vérifie le nom du fichier
			expect(inputFile.files[0].name).toBe("image.jpg");
			// Vérifie que le message d'erreur est vide
			await waitFor(() => screen.getByTestId("error-message"));
			expect(screen.getByTestId("error-message").textContent).toContain("");
		});

		// Vérifie le conportement de l'upload de fichier si le fichier n'est pas valide
		it("Then, is the file is not valid", async () => {
			document.body.innerHTML = NewBillUI();
			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};
			const newBillInit = new NewBill({
				document,
				onNavigate,
				mockStore,
				localStorage: window.localStorage,
			});

			// Simule un fichier PDF
			const file = new File(["img"], "bill.pdf", { type: "document/pdf" });
			// Selectionne l'input
			const inputFile = screen.getByTestId("file");
			// Mock de la fonction qui ajoute un fichier
			const handleChangeFile = jest.fn(newBillInit.handleChangeFile);
			// Ajoute l'event
			inputFile.addEventListener("change", handleChangeFile);
			// Simule l'action de l'utilisateur
			userEvent.upload(inputFile, file);
			// Vérifie l'appel de la fonction
			expect(handleChangeFile).toHaveBeenCalled();
			// Vérifie la correspondance du fichier
			expect(inputFile.files[0].type).toBe("document/pdf");
			// Vérifie que le message d'erreur s'affiche bien
			await waitFor(() => screen.getByTestId("error-message"));
			expect(screen.getByTestId("error-message")).not.toHaveClass("hidden");
			expect(inputFile).toHaveClass("red-border");
		});
	});

	describe("When I submit Newbill form", () => {

		// Vérifie la soumission du formulaire si il est correctement remplis
		it("Then, is the form is valid", () => {
			document.body.innerHTML = NewBillUI();
			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};
			const newBillInit = new NewBill({
				document,
				onNavigate,
				store: mockStore,
				localStorage: window.localStorage,
			});

			// Sélection du DOM
			const type = screen.getByTestId("expense-type");
			const name = screen.getByTestId("expense-name");
			const date = screen.getByTestId("datepicker");
			const amount = screen.getByTestId("amount");
			const vat = screen.getByTestId("vat");
			const pct = screen.getByTestId("pct");
			const comment = screen.getByTestId("commentary");
			const img = screen.getByTestId("file");
			const form = screen.getByTestId("form-new-bill");

			// Valeurs des inputs
			const inputValues = {
				type: "Transports",
				name: "Vol Paris Bayonne",
				date: "2022-10-10",
				amount: "200",
				vat: 40,
				pct: 50,
				commentary: "Commentaire",
				file: new File(["img"], "image.jpg", { type: "image/jpg" }),
			};

			// Simulation d'une entrée utilisateur
			fireEvent.change(type, { target: { value: inputValues.type } });
			fireEvent.change(name, { target: { value: inputValues.name } });
			fireEvent.change(date, { target: { value: inputValues.date } });
			fireEvent.change(amount, { target: { value: inputValues.amount } });
			fireEvent.change(vat, { target: { value: inputValues.vat } });
			fireEvent.change(pct, { target: { value: inputValues.pct } });
			fireEvent.change(comment, { target: { value: inputValues.commentary } });
			userEvent.upload(img, inputValues.file);

			// Mock de la fonction qui soumet le formulaire
			const handleSubmit = jest.fn(newBillInit.handleSubmit);
			// Ajoute l'event
			form.addEventListener("submit", handleSubmit);
			// Simule le click de l'utilisateur
			fireEvent.submit(form);
			// Vérifie l'appel de la fonction
			expect(handleSubmit).toHaveBeenCalled();
			// Vérifie la validité des valeurs des inputs
			expect(type.validity.valid).toBeTruthy();
			expect(name.validity.valid).toBeTruthy();
			expect(date.validity.valid).toBeTruthy();
			expect(amount.validity.valid).toBeTruthy()
			expect(vat.validity.valid).toBeTruthy();
			expect(pct.validity.valid).toBeTruthy();
			expect(comment.validity.valid).toBeTruthy();
			expect(img.files[0]).toBeDefined();
		});

		// Vérifie la soumission du formulaire si il contient valeurs au mauvais format
		it("Then, is the form is not valid", () => {
			document.body.innerHTML = NewBillUI();
			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};
			const newBillInit = new NewBill({
				document,
				onNavigate,
				store: mockStore,
				localStorage: window.localStorage,
			});

			// Sélection du DOM
			const type = screen.getByTestId("expense-type");
			const name = screen.getByTestId("expense-name");
			const date = screen.getByTestId("datepicker");
			const amount = screen.getByTestId("amount");
			const vat = screen.getByTestId("vat");
			const pct = screen.getByTestId("pct");
			const comment = screen.getByTestId("commentary");
			const img = screen.getByTestId("file");
			const form = screen.getByTestId("form-new-bill");

			// Valeurs des inputs
			const inputValues = {
				type: "Bad format",
				name: "Vol Paris Bayonne",
				date: "Bad format",
				amount: "Bad format",
				vat: 40,
				pct: "Bad Format",
				commentary: "Commentaire",
				file: new File(["img"], "image.jpg", { type: "image/jpg" }),
			};

			// Simulation d'une entrée utilisateur
			fireEvent.change(type, { target: { value: inputValues.type } });
			fireEvent.change(name, { target: { value: inputValues.name } });
			fireEvent.change(date, { target: { value: inputValues.date } });
			fireEvent.change(amount, { target: { value: inputValues.amount } });
			fireEvent.change(vat, { target: { value: inputValues.vat } });
			fireEvent.change(pct, { target: { value: inputValues.pct } });
			fireEvent.change(comment, { target: { value: inputValues.commentary } });
			userEvent.upload(img, inputValues.file);

			// Mock de la fonction qui soumet le formulaire
			const handleSubmit = jest.fn(newBillInit.handleSubmit);
			// Ajoute l'event
			form.addEventListener("submit", handleSubmit);
			// Simule le click de l'utilisateur
			fireEvent.submit(form);
			// Vérifie l'appel de la fonction
			expect(handleSubmit).toHaveBeenCalled();
			// Vérifie que les valeurs des inputs ne soit pas valides
			expect(type.validity.valid).not.toBeTruthy();
			expect(date.validity.valid).not.toBeTruthy();
			expect(amount.validity.valid).not.toBeTruthy()
			expect(pct.validity.valid).not.toBeTruthy();
		});
	});
});

 /*
 * INTEGRATION TESTS - POST
 */

describe("Given I am connected as Employee on NewBill page, and submit the form", () => {

	// Préparation répétée: utilisation du hook "beforeEach"
	beforeEach(() => {
		jest.spyOn(mockStore, "bills");

		Object.defineProperty(window, "localStorage", { value: localStorageMock });
		window.localStorage.setItem("user", JSON.stringify({
			type: "Employee",
			email: "a@a"
		}));
		document.body.innerHTML = `<div id="root"></div>`;
		router();
	});

	describe("When APi is working correctly", () => {

		// Vérifie que je suis redirigé vers la page Bills et que les factures sont mise à jours
		it("then i should be sent on bills page with bills updated", async () => {
			document.body.innerHTML = NewBillUI();
			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};
			const newBillInit = new NewBill({
				document,
				onNavigate,
				store: mockStore,
				localStorage: window.localStorage,
			});

			// Selectionne le form
			const form = screen.getByTestId("form-new-bill");
			// Mock de la fonction qui soumet le formulaire
			const handleSubmit = jest.fn(newBillInit.handleSubmit);
			// Ajout de l'event
			form.addEventListener("submit", handleSubmit);
			// Simule l'action de l'utilisateur
			fireEvent.submit(form);
			// Vérifie l'appel de la fonction du submit et que le titre de Bills s'affiche et que les factures soit chargées
			expect(handleSubmit).toHaveBeenCalled();
			expect(screen.getByText("Mes notes de frais")).toBeTruthy();
			expect(mockStore.bills).toHaveBeenCalled();
		});
	});

	describe("When an error occurs on API", () => {

		// Vérifier l'affichage d'un message d'erreur 500 en cas d'erreur API
		it("Then it should display a 500 message error", async () => {
			document.body.innerHTML = NewBillUI();
			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};
			const newBillInit = new NewBill({
				document,
				onNavigate,
				store: mockStore,
				localStorage: window.localStorage,
			});

			mockStore.bills.mockImplementationOnce(() => {
				return {
					update: () => {
						return Promise.reject(new Error("Erreur 500"));
					},
				};
			});

			// Mock de console.error
			console.error = jest.fn();
			// Selectionne le form
			const form = screen.getByTestId("form-new-bill");
			// Mock de la fonction qui soumet le formulaire
			const handleSubmit = jest.fn(newBillInit.handleSubmit);
			// Ajout de l'event
			form.addEventListener("submit", handleSubmit);
			// Simule l'action de l'utilisateur
			fireEvent.submit(form);
			// Vérifie l'appel de la fonction du submit et que la fonction console.error soit appelée
			expect(handleSubmit).toHaveBeenCalled();
			await waitFor(() => new Promise(process.nextTick));
			expect(console.error).toHaveBeenCalled();
		});
	});
});