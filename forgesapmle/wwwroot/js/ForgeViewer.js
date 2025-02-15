﻿/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Forge Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

var viewer;

// @urn the model to show
// @viewablesId which viewables to show, applies to BIM 360 Plans folder
function launchViewer(urn, viewableId) {
    var options = {
        env: 'AutodeskProduction',
        getAccessToken: getForgeToken,
        api: 'derivativeV2' + (atob(urn.replace('_', '/')).indexOf('emea') > -1 ? '_EU' : '') // handle BIM 360 US and EU regions
    };

    Autodesk.Viewing.Initializer(options, () => {

        var config3d = {
            loaderExtensions: { svf: "Autodesk.MemoryLimited" },
            extensions: ['ForgeViewerDA4RExtension']
        };

        viewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById('forge-viewer'), config3d);

        viewer.start();
        var documentId = 'urn:' + urn;
        Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
    });

    function onDocumentLoadSuccess(doc) {
        // if a viewableId was specified, load that view, otherwise the default view
        var viewables = (viewableId ? doc.getRoot().findByGuid(viewableId) : doc.getRoot().getDefaultGeometry());

        doc.downloadAecModelData();

        viewer.loadDocumentNode(doc, viewables).then(i => {
            viewer.loadExtension('Autodesk.AEC.LevelsExtension');
            viewer.loadExtension('Autodesk.DocumentBrowser');
            viewer.loadExtension('Autodesk.Viewing.MemoryLimitedDebug');
        });
    }

    function onDocumentLoadFailure(viewerErrorCode) {
        console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
    }
}

function getForgeToken(callback) {
    fetch('/api/forge/oauth/token').then(res => {
        res.json().then(data => {
            callback(data.access_token, data.expires_in);
        });
    });
}