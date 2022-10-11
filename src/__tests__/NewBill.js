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

 jest.mock("../app/store", () => mockStore);

 describe("Given I am connected as an employee", () => {
	describe("When I am on NewBill Page", () => {
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

		// Vérifie si il y a le formulaire est affiché
		it("Then title text content should be displayed", async () => {
			window.onNavigate(ROUTES_PATH.NewBill);
			expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
		});

		// Vérifie les champs qui sont requis ou non
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
		it("then I should stay on new 'Bill page'", () => {
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

			const form = screen.getByTestId("form-new-bill");
			// mock the function handleSubmit
			const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));

			form.addEventListener("submit", handleSubmit);
			fireEvent.submit(form);
			expect(handleSubmit).toHaveBeenCalled();
			expect(form).toBeTruthy();
		});
	});

	describe("When I submit Newbill form", () => {

		// Vérifie si le form est valide
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

			// Soummission du formulaire
			const handleSubmit = jest.fn(newBillInit.handleSubmit);
			form.addEventListener("submit", handleSubmit);
			fireEvent.submit(form);

			expect(handleSubmit).toHaveBeenCalled();
			expect(type.validity.valid).toBeTruthy();
			expect(name.validity.valid).toBeTruthy();
			expect(date.validity.valid).toBeTruthy();
			expect(amount.validity.valid).toBeTruthy()
			expect(vat.validity.valid).toBeTruthy();
			expect(pct.validity.valid).toBeTruthy();
			expect(comment.validity.valid).toBeTruthy();
			expect(img.files[0]).toBeDefined();
		});
	});

	// Vérifie le conportement de l'upload de fichier
	describe("When I upload file in form", () => {

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

			const file = new File(["img"], "image.jpg", { type: "image/jpg" });
			const inputFile = screen.getByTestId("file");

			const handleChangeFile = jest.fn(newBillInit.handleChangeFile);
			inputFile.addEventListener("change", handleChangeFile);

			userEvent.upload(inputFile, file);

			expect(handleChangeFile).toHaveBeenCalled();
			expect(inputFile.files[0]).toStrictEqual(file);
			expect(inputFile.files[0].name).toBe("image.jpg");

			await waitFor(() => screen.getByTestId("error-message"));
			expect(screen.getByTestId("error-message").textContent).toContain("");
		});

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

			const file = new File(["img"], "bill.pdf", { type: "document/pdf" });
			const inputFile = screen.getByTestId("file");

			const handleChangeFile = jest.fn(newBillInit.handleChangeFile);
			inputFile.addEventListener("change", handleChangeFile);

			userEvent.upload(inputFile, file);

			expect(handleChangeFile).toHaveBeenCalled();
			expect(inputFile.files[0].type).toBe("document/pdf");

			await waitFor(() => screen.getByTestId("error-message"));
			expect(screen.getByTestId("error-message")).not.toHaveClass("hidden");
		});
	});
});

 /*
 * INTEGRATION TESTS - POST
 */

describe("Given I am connected as Employee on NewBill page, and submit the form", () => {
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

	describe("when APi is working well", () => {

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

			const form = screen.getByTestId("form-new-bill");
			const handleSubmit = jest.fn(newBillInit.handleSubmit);
			form.addEventListener("submit", handleSubmit);

			fireEvent.submit(form);

			expect(handleSubmit).toHaveBeenCalled();
			expect(screen.getByText("Mes notes de frais")).toBeTruthy();
			expect(mockStore.bills).toHaveBeenCalled();
		});
	});

	// Vérifier l'affichage d'un message d'erreur en cas d'erreur API
	describe("When an error occurs on API", () => {

		it("then it should display a message error", async () => {
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
						return Promise.reject(new Error("Erreur 404"));
					},
				};
			});
			console.error = jest.fn();
			const form = screen.getByTestId("form-new-bill");
			const handleSubmit = jest.fn(newBillInit.handleSubmit);
			form.addEventListener("submit", handleSubmit);

			fireEvent.submit(form);

			expect(handleSubmit).toHaveBeenCalled();
			await waitFor(() => new Promise(process.nextTick));
			expect(console.error).toHaveBeenCalled();
		});
	});
});