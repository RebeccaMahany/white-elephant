package main

import (
	"fmt"
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"go.uber.org/zap"
	"net/http"
	"os"
)

var logger *zap.SugaredLogger
var sessionStore *sessions.CookieStore

const (
	gameCodeSessionVariable string = "current-game-code"
)

func homePageHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Gotta do some stuff here eventually")
}

func createGameHandler(w http.ResponseWriter, r *http.Request) {
	// Check to make sure there isn't already a game going on
	session, _ := sessionStore.Get(r, "session-name") // TODO what the fuck is session-name supposed to be
	if _, ok := session.Values[gameCodeSessionVariable]; ok {
		logger.Info("received request to init game but game already exists")
		// TODO return
	}

	// Create a new game, with code
	game := newGame()
	session.Values[gameCodeSessionVariable] = game.Code

	// Return code for display
}

func createPlayerHandler(w http.ResponseWriter, r *http.Request) {
	//vars := mux.Vars(r)
	//code := vars["code"]

	// Check to make sure the game is still in setup phase

	// Create player

	// Save ID to session
}

func createPresentHandler(w http.ResponseWriter, r *http.Request) {
	//vars := mux.Vars(r)
	//code := vars["code"]

	// Check to make sure the game is still in setup phase

	// Create present
}

func startGameHandler(w http.ResponseWriter, r *http.Request) {
	//vars := mux.Vars(r)
	//code := vars["code"]

	// Check to make sure the game is still in setup phase
}

func pauseGameHandler(w http.ResponseWriter, r *http.Request) {
	//vars := mux.Vars(r)
	//code := vars["code"]

	// Get current game status
}

func resumeGameHandler(w http.ResponseWriter, r *http.Request) {
	//vars := mux.Vars(r)
	//code := vars["code"]
}

func choosePresentHandler(w http.ResponseWriter, r *http.Request) {
	//vars := mux.Vars(r)
	//code := vars["code"]
	//presentID := vars["id"]
}

func endGameHandler(w http.ResponseWriter, r *http.Request) {
	//vars := mux.Vars(r)
	//code := vars["code"]
}

func handleRequests() {
	gameRouter := mux.NewRouter().StrictSlash(true)
	gameRouter.HandleFunc("/", homePageHandler).Methods(http.MethodGet)
	gameRouter.HandleFunc("/game", createGameHandler).Methods(http.MethodPost)
	gameRouter.HandleFunc("/game/{code}/player", createPlayerHandler).Methods(http.MethodPost)
	gameRouter.HandleFunc("/game/{code}/present", createPresentHandler).Methods(http.MethodPost)
	gameRouter.HandleFunc("/game/{code}/start", startGameHandler).Methods(http.MethodPut)
	gameRouter.HandleFunc("/game/{code}/pause", pauseGameHandler).Methods(http.MethodPut)
	gameRouter.HandleFunc("/game/{code}/resume", resumeGameHandler).Methods(http.MethodPut)
	gameRouter.HandleFunc("/game/{code}/present/{id}/select", choosePresentHandler).Methods(http.MethodPut)
	gameRouter.HandleFunc("/game/{code}", endGameHandler).Methods(http.MethodDelete)

	logger.Fatal(http.ListenAndServe(":10000", gameRouter))
}

func initLogging() {
	prodLogger, _ := zap.NewProduction()
	defer prodLogger.Sync() // flushes buffer, if any
	logger = prodLogger.Sugar()
}

func initSessionStore() {
	sessionStore = sessions.NewCookieStore([]byte(os.Getenv("SESSION_KEY")))
}

func main() {
	initLogging()
	initSessionStore()
	handleRequests()
}
