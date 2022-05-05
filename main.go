package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"net/url"
)

func main() {
	router := gin.Default()
	router.Static("/css", "./css")
	router.Static("/img", "./img")
	router.Static("/ico", "./ico")
	router.Static("/js", "./js")
	router.StaticFile("/manifest.mf", "./mf/manifest.mf")
	router.LoadHTMLGlob("templates/*")
	router.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.htm", nil)
	})
	router.GET("/index.html", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.htm", nil)
	})
	router.GET("/offline.html", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.htm", nil)
	})
	router.NoRoute(func(c *gin.Context) {
		location := url.URL{Path: "/",}
		c.Redirect(http.StatusFound, location.RequestURI())
	})
	router.Run(":8080")
}