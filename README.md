DisconnectFiles
===============

Web-service for disconnect files (MS Access databases) from MS Windows file server for unprivileged users.
Work on Windows 7+

Russian description
-------------------

Веб-приложение позволяет удалённо отключать файлы (разрабатывалось для баз данных MS Access) на файловом сервере MS Windows.

Для отключения файлов пользователям приложение должно быть запущено с правами администратора.

DisconnectFilesClassic - версия с классическими формами и запросами.

DisconnectFilesXHR - версия, где запросы выполняются с помощью XMLHttpRequest.

Для работы необходимо запустить приложение с ОС MS Windows 7 или выше, где есть команда openfiles.exe из под учётной записи администратора.

Авторизация через Active Directory. Вход в вэб-интерфейс разрешатся только пользователям, которые состоят в группе. Имя группы указывается в файле настроек settings.json

Так же для работы требуется утилита iconv.exe из GNU Utils для преобразования вывода команда openfiles.exe c CP 866 с Unicode.
