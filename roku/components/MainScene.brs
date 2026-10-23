sub init()
    m.status = m.top.findNode("status")
    m.ticker = m.top.findNode("ticker")
    m.top.observeField("screenId", "onScreenIdChanged")
    onScreenIdChanged()
end sub

sub onScreenIdChanged()
    screenId = m.top.screenId
    if screenId = invalid or screenId = "" then screenId = "lobby"
    m.status.text = "Church Signage — screen: " + screenId
    ' TODO: Fetch the configured HTTPS JSON endpoint for this screen.
    ' TODO: Render the current scheduled slide and rotate on duration.
    ' TODO: Animate a ticker using a SceneGraph animation or scrolling group.
end sub
