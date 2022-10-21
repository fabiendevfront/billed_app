/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { screen, waitFor, fireEvent } from "@testing-library/dom";
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";

// Mock du store
jest.mock("../app/store", () => mockStore);

describe("Given i am connected as an employee", () => {
	describe("When i am on Bills Page", () => {

		// Vérifie l'affichage de la page loading
		it('Then loading page should be rendered', () => {
			const html = BillsUI({ loading: true });
			document.body.innerHTML = html;
			expect(screen.getByText("Loading...")).toBeTruthy();
		})

		// Vérifie l'affichage de la page d'erreur
		it("Then error page should be rendered", () => {
			const html = BillsUI({ loading: false, error: true });
			document.body.innerHTML = html;
			expect(screen.getByTestId("error-message")).toBeTruthy();
		});

		// Vérifie que l'icone "factures" soit en surbrillance
		it("Then bill icon in vertical layout should be highlighted", async () => {
			Object.defineProperty(window, "localStorage", { value: localStorageMock });
			window.localStorage.setItem("user", JSON.stringify({
				type: 'Employee'
			}));
			document.body.innerHTML = `<div id="root"></div>`;
			router();
			window.onNavigate(ROUTES_PATH.Bills);
			await waitFor(() => screen.getByTestId("icon-window"));
			const windowIcon = screen.getByTestId("icon-window");
			// Utilisation du matcher Jest-dom "toHaveClass" pour verifier si l'élément à la class "active-icon"
			expect(windowIcon).toHaveClass("active-icon");
		})

		// Vérifie que les factures soit correctement classée de la plus récente à la plus ancienne
		it("Then bills should be ordered from earliest to latest", () => {
			document.body.innerHTML = BillsUI({ data: bills });
			const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML);
			const antiChrono = (a, b) => ((a < b) ? 1 : -1);
			const datesSorted = [...dates].sort(antiChrono);
			expect(dates).toEqual(datesSorted);
		})
	});

    describe("When i click on an eye icon", () => {

		// Vérifie l'ouverture de la modale si click sur le bouton "oeil" d'une facture
		it("Then the modal should open", () => {
			Object.defineProperty(window, "localStorage", { value: localStorageMock });
			window.localStorage.setItem("user", JSON.stringify({
				type: "Employee"
			}));
			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};
			const billsInit = new Bills({
				document,
				onNavigate,
				store: mockStore,
				localStorage: window.localStorage
			});
			// Affiche les factures dans le HTML
			const html = BillsUI({ data: bills });
			document.body.innerHTML = html;
			// Mock de la modale (jQuery)
			$.fn.modal = jest.fn();
			// Sélectionne le premier bouton trouvé
			const eyeIcon = screen.getAllByTestId("icon-eye")[0];
			// Mock de la fonction qui ouvre la modale
			const handleClickIconEye = jest.fn(billsInit.handleClickIconEye(eyeIcon));
			// Ajoute l'event
			eyeIcon.addEventListener("click", handleClickIconEye);
			// Simule le click de l'utilisateur
			fireEvent.click(eyeIcon);
			// Vérifie l'appel de la fonction
			expect(handleClickIconEye).toHaveBeenCalled();
		})
    });


    describe("When i click on the button new bill", () => {

		// Vérifie que le formulaire de création d'une nouvelle facture s'affiche
		it("Then the new bill form should open", () => {
			Object.defineProperty(window, "localStorage", { value: localStorageMock });
			window.localStorage.setItem('user', JSON.stringify({
				type: 'Employee'
			}));
			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname })
			};
			const billsInit = new Bills({
				document,
				onNavigate,
				store: mockStore,
				localStorage: window.localStorage
			});
			// Sélectionne le bouton qui ouvre le form
			const btnNewBill = screen.getByTestId("btn-new-bill");
			// Mock de la fonction qui affiche le formulaire
			const handleClickNewBill = jest.fn(billsInit.handleClickNewBill);
			// Ajoute l'event
			btnNewBill.addEventListener("click", handleClickNewBill);
			// Simule le click de l'utilisateur
			fireEvent.click(btnNewBill);
			// Vérifie l'appel de la fonction et que le formulaire s'affiche
			expect(handleClickNewBill).toHaveBeenCalled();
			expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
		});
    });
});


/*
* Test d'intégration GET Bills
*/
describe("Given I am connected as an employee", () => {
	describe("When i am on Bills Page", () => {

		// Vérifie la récupération des factures depuis L'API mocké
		it("Then fetches bills from mock API GET", async () => {
			jest.spyOn(mockStore, "bills");
			Object.defineProperty(window, "localStorage", { value: localStorageMock });
			window.localStorage.setItem("user", JSON.stringify({
				type: "Employee"
			}));
			document.body.innerHTML = `<div id="root"></div>`;
			router();

			window.onNavigate(ROUTES_PATH.Bills);
			expect(await waitFor(() => screen.getByText("Mes notes de frais"))).toBeTruthy();
			expect(await waitFor(() => screen.getByTestId("tbody"))).toBeTruthy();
		});
	});

	describe("When an error occurs on API", () => {

		// Préparation répétée: utilisation du hook "beforeEach"
		beforeEach(() => {
			// Fonction mockée qui surveille les appels à "mockStore"
			jest.spyOn(mockStore, "bills");
			Object.defineProperty(window, "localStorage", { value: localStorageMock });
			window.localStorage.setItem("user", JSON.stringify({
				type: "Employee",
				email: "a@a"
			}));
			document.body.innerHTML = `<div id="root"></div>`;
			router();
		});

		// Simule le rejet de la promesse, vérifie l'affichage d'un message d'erreur si le format de date est incorrect
		it("Then return an error if the date format is not correct", async () => {
			const mockBills = await mockStore.bills().list();
			const errorBill = [{ ...mockBills[0] }];
			errorBill[0].date = "2022/mm/10";
			// mockImplementationOnce : retourne le résultat d'une fonction mokée.
			mockStore.bills.mockImplementationOnce(() => {
				return {
					list: () => {
						return Promise.resolve(errorBill);
					},
				};
			});

			window.onNavigate(ROUTES_PATH.Bills);
			expect(await waitFor(() => screen.getByText("2022/mm/10"))).toBeTruthy();
		});

		// Simule le rejet de la promesse, vérifie l'affichage du message d'erreur 404
		it("Then fetches bills from an API and fails with 404 message error", async () => {
			mockStore.bills.mockImplementationOnce(() => {
				return {
					list: () => {
						return Promise.reject(new Error("Erreur 404"))
					}
				}
			});
			window.onNavigate(ROUTES_PATH.Bills);
			await new Promise(process.nextTick);
			const message = await waitFor(() => screen.getByText(/Erreur 404/));
			expect(message).toBeTruthy();
		});

		// Simule le rejet de la promesse, vérifie l'affichage du message d'erreur 500
		it("Then fetches messages from an API and fails with 500 message error", async () => {
			mockStore.bills.mockImplementationOnce(() => {
				return {
					list: () => {
						return Promise.reject(new Error("Erreur 500"))
					}
				}
			});
			window.onNavigate(ROUTES_PATH.Bills);
			await new Promise(process.nextTick);
			const message = await waitFor(() => screen.getByText(/Erreur 500/));
			expect(message).toBeTruthy();
		});
	});
});
